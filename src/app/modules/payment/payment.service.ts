import Stripe from "stripe";
import { BookingStatus, UserRole } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import config from "../../../config";

let stripeClient: Stripe | null = null;

const getStripeClient = () => {
    if (!config.stripe_secret_key) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "STRIPE_SECRET_KEY is not configured");
    }

    if (!stripeClient) {
        stripeClient = new Stripe(config.stripe_secret_key as string);
    }

    return stripeClient;
};

const getStripeWebhookSecret = () => {
    if (!config.stripe_webhook_secret) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "STRIPE_WEBHOOK_SECRET is not configured");
    }

    return config.stripe_webhook_secret;
};

// ==================== INITIATE PAYMENT ====================
const initiatePayment = async (touristEmail: string, bookingId: string) => {
    const tourist = await prisma.user.findUnique({
        where: { email: touristEmail }
    });

    if (!tourist || tourist.role !== UserRole.TOURIST) {
        throw new ApiError(httpStatus.FORBIDDEN, "Only tourists can make payments!");
    }

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            tour: true,
            payment: true
        }
    });

    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, "Booking not found!");
    }

    if (booking.touristId !== tourist.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You can only pay for your own bookings!");
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Booking must be confirmed before payment!");
    }

    if (booking.payment?.paymentStatus === "completed") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Booking is already paid!");
    }

    const payment = booking.payment
        ? await prisma.payment.update({
            where: { id: booking.payment.id },
            data: {
                amount: booking.totalPrice,
                paymentMethod: "stripe",
                paymentStatus: "pending",
                transactionId: null
            }
        })
        : await prisma.payment.create({
            data: {
                bookingId: booking.id,
                userId: tourist.id,
                amount: booking.totalPrice,
                paymentMethod: "stripe",
                paymentStatus: "pending"
            }
        });

    if (!config.frontend_url) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "FRONTEND_URL is not configured");
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}&paymentId=${payment.id}`,
        cancel_url: `${config.frontend_url}/payment/cancel?paymentId=${payment.id}`,
        metadata: {
            paymentId: payment.id,
            bookingId: booking.id,
            touristId: tourist.id
        },
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: config.stripe_currency,
                    unit_amount: Math.round(booking.totalPrice * 100),
                    product_data: {
                        name: booking.tour.title,
                        description: `Booking for ${booking.numberOfPeople} traveler(s)`
                    }
                }
            }
        ]
    });

    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            transactionId: session.id
        }
    });

    return {
        paymentId: payment.id,
        bookingId: booking.id,
        checkoutUrl: session.url,
        sessionId: session.id,
        amount: booking.totalPrice,
        currency: config.stripe_currency
    };
};

// ==================== VERIFY PAYMENT (MANUAL/FALLBACK) ====================
const verifyPayment = async (paymentId: string, payload: any) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
    });

    if (!payment) {
        throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
    }

    const allowedStatuses = ["pending", "completed", "failed", "cancelled"];
    const normalizedStatus = String(payload?.status || "completed").toLowerCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid payment status");
    }

    const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
            paymentStatus: normalizedStatus,
            paymentMethod: String(payload?.paymentMethod || "stripe").toLowerCase(),
            transactionId: payload?.transactionId || payment.transactionId
        }
    });

    if (updatedPayment.paymentStatus === "completed") {
        await prisma.booking.update({
            where: { id: updatedPayment.bookingId },
            data: { status: BookingStatus.CONFIRMED }
        });
    }

    return updatedPayment;
};

// ==================== STRIPE WEBHOOK ====================
const handleStripeWebhook = async (signature: string | undefined, rawBody: Buffer) => {
    if (!signature) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Missing Stripe signature");
    }

    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentId = session.metadata?.paymentId;

            if (!paymentId) {
                break;
            }

            const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
            if (!payment) {
                break;
            }

            await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    paymentStatus: "completed",
                    paymentMethod: "stripe",
                    transactionId: session.id
                }
            });

            await prisma.booking.update({
                where: { id: payment.bookingId },
                data: { status: BookingStatus.CONFIRMED }
            });
            break;
        }
        case "checkout.session.expired":
        case "checkout.session.async_payment_failed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentId = session.metadata?.paymentId;

            if (!paymentId) {
                break;
            }

            await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    paymentStatus: "failed",
                    paymentMethod: "stripe",
                    transactionId: session.id
                }
            });
            break;
        }
        default:
            break;
    }

    return { received: true, eventType: event.type };
};

// ==================== VERIFY SESSION (post-redirect, works without webhook) ====================
const verifySession = async (touristEmail: string, sessionId: string, paymentId: string) => {
    const tourist = await prisma.user.findUnique({ where: { email: touristEmail } });

    if (!tourist || tourist.role !== UserRole.TOURIST) {
        throw new ApiError(httpStatus.FORBIDDEN, "Only tourists can verify payments!");
    }

    // Confirm this payment belongs to this tourist
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { booking: true }
    });

    if (!payment) {
        throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
    }

    if (payment.userId !== tourist.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You can only verify your own payments!");
    }

    // Already completed — nothing to do
    if (payment.paymentStatus === "completed") {
        return { alreadyCompleted: true, paymentStatus: "completed" };
    }

    // Ask Stripe directly for the session status
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
        await prisma.payment.update({
            where: { id: paymentId },
            data: {
                paymentStatus: "completed",
                transactionId: session.id
            }
        });

        await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: BookingStatus.CONFIRMED }
        });

        return { alreadyCompleted: false, paymentStatus: "completed" };
    }

    return { alreadyCompleted: false, paymentStatus: session.payment_status };
};

// ==================== GET PAYMENT BY BOOKING ID ====================
const getPaymentByBookingId = async (bookingId: string, userEmail: string) => {
    const user = await prisma.user.findUnique({
        where: { email: userEmail }
    });

    const payment = await prisma.payment.findUnique({
        where: { bookingId },
        include: {
            booking: {
                include: {
                    tour: {
                        select: {
                            title: true
                        }
                    },
                    tourist: {
                        select: {
                            email: true,
                            profile: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!payment) {
        throw new ApiError(httpStatus.NOT_FOUND, "Payment not found!");
    }

    // Check authorization
    if (user?.role !== UserRole.ADMIN && 
        payment.booking.touristId !== user?.id && 
        payment.booking.guideId !== user?.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You don't have access to this payment!");
    }

    return payment;
};

// ==================== GET ALL PAYMENTS (ADMIN) ====================
const getAllPayments = async (params: any) => {
    const { page = 1, limit = 10, status } = params;
    const skip = (Number(page) - 1) * Number(limit);

    const whereConditions: any = {};

    if (status) {
        whereConditions.paymentStatus = status;
    }

    const payments = await prisma.payment.findMany({
        where: whereConditions,
        skip,
        take: Number(limit),
        include: {
            booking: {
                include: {
                    tour: {
                        select: {
                            title: true
                        }
                    },
                    tourist: {
                        select: {
                            email: true,
                            profile: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const total = await prisma.payment.count({ where: whereConditions });

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total
        },
        data: payments
    };
};

export const PaymentService = {
    initiatePayment,
    verifyPayment,
    verifySession,
    handleStripeWebhook,
    getPaymentByBookingId,
    getAllPayments
};
