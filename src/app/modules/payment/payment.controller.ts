import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import httpStatus from "http-status";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.initiatePayment(req.user!.email, req.body.bookingId);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Payment initiated successfully!",
        data: result
    });
});

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.verifyPayment(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment verified successfully!",
        data: result
    });
});

const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string | undefined;
    const result = await PaymentService.handleStripeWebhook(signature, req.body as Buffer);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Stripe webhook processed successfully!",
        data: result
    });
});

const getPaymentByBookingId = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.getPaymentByBookingId(req.params.bookingId, req.user!.email);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment retrieved successfully!",
        data: result
    });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.getAllPayments(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payments retrieved successfully!",
        meta: result.meta,
        data: result.data
    });
});

const verifySession = catchAsync(async (req: Request, res: Response) => {
    const { sessionId, paymentId } = req.body;
    const result = await PaymentService.verifySession(req.user!.email, sessionId, paymentId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Session verified successfully!",
        data: result
    });
});

export const PaymentController = {
    initiatePayment,
    verifyPayment,
    verifySession,
    stripeWebhook,
    getPaymentByBookingId,
    getAllPayments
};
