import { BookingStatus, UserRole } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

// ==================== CREATE BOOKING ====================
const createBooking = async (touristEmail: string, payload: any) => {
    // Get tourist
    const tourist = await prisma.user.findUnique({
        where: { email: touristEmail }
    });

    if (!tourist || tourist.role !== UserRole.TOURIST) {
        throw new ApiError(httpStatus.FORBIDDEN, "Only tourists can create bookings!");
    }

    // Get tour details
    const tour = await prisma.tour.findUnique({
        where: { id: payload.tourId },
        select: {
            id: true,
            price: true,
            isActive: true,
            guideId: true
        }
    });

    if (!tour) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tour not found!");
    }

    if (!tour.isActive) {
        throw new ApiError(httpStatus.BAD_REQUEST, "This tour is not available!");
    }

    // Calculate total price
    const totalPrice = tour.price * (payload.numberOfPeople || 1);

    // Create booking
    const booking = await prisma.booking.create({
        data: {
            touristId: tourist.id,
            guideId: tour.guideId,
            tourId: tour.id,
            bookingDate: new Date(payload.bookingDate),
            numberOfPeople: payload.numberOfPeople || 1,
            totalPrice,
            specialRequests: payload.specialRequests,
            status: BookingStatus.PENDING
        },
        include: {
            tour: true,
            tourist: {
                select: {
                    email: true,
                    profile: true
                }
            },
            guide: {
                select: {
                    email: true,
                    profile: true
                }
            }
        }
    });

    return booking;
};

// ==================== GET ALL BOOKINGS ====================
const getAllBookings = async (params: any) => {
    const { page = 1, limit = 10, status } = params;
    const skip = (Number(page) - 1) * Number(limit);

    const whereConditions: any = {};

    if (status) {
        whereConditions.status = status;
    }

    const bookings = await prisma.booking.findMany({
        where: whereConditions,
        skip,
        take: Number(limit),
        include: {
            tour: true,
            tourist: {
                select: {
                    email: true,
                    profile: {
                        select: {
                            name: true,
                            phone: true
                        }
                    }
                }
            },
            guide: {
                select: {
                    email: true,
                    profile: {
                        select: {
                            name: true,
                            phone: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const total = await prisma.booking.count({ where: whereConditions });

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total
        },
        data: bookings
    };
};

// ==================== GET MY BOOKINGS (TOURIST) ====================
const getMyBookings = async (touristEmail: string) => {
    const tourist = await prisma.user.findUnique({
        where: { email: touristEmail }
    });

    if (!tourist) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    const bookings = await prisma.booking.findMany({
        where: { touristId: tourist.id },
        include: {
            tour: {
                include: {
                    guide: {
                        include: {
                            profile: {
                                select: {
                                    name: true,
                                    profilePicture: true
                                }
                            }
                        }
                    }
                }
            },
            guide: {
                select: {
                    email: true,
                    profile: {
                        select: {
                            name: true,
                            phone: true,
                            profilePicture: true
                        }
                    }
                }
            },
            payment: {
                select: {
                    id: true,
                    paymentStatus: true,
                    amount: true,
                    paymentMethod: true,
                    transactionId: true
                }
            }
        },
        orderBy: {
            bookingDate: 'desc'
        }
    });

    return bookings;
};

// ==================== GET BOOKINGS FOR GUIDE ====================
const getGuideBookings = async (guideEmail: string) => {
    const guide = await prisma.user.findUnique({
        where: { email: guideEmail }
    });

    if (!guide) {
        throw new ApiError(httpStatus.NOT_FOUND, "Guide not found!");
    }

    const bookings = await prisma.booking.findMany({
        where: { guideId: guide.id },
        include: {
            tour: true,
            tourist: {
                select: {
                    email: true,
                    profile: {
                        select: {
                            name: true,
                            phone: true,
                            profilePicture: true
                        }
                    }
                }
            },
            payment: {
                select: {
                    id: true,
                    paymentStatus: true,
                    amount: true,
                    paymentMethod: true,
                    transactionId: true
                }
            }
        },
        orderBy: {
            bookingDate: 'desc'
        }
    });

    return bookings;
};

// ==================== GET BOOKING BY ID ====================
const getBookingById = async (id: string, userEmail: string) => {
    const user = await prisma.user.findUnique({
        where: { email: userEmail }
    });

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            tour: {
                include: {
                    guide: true
                }
            },
            tourist: {
                select: {
                    email: true,
                    profile: true
                }
            },
            guide: {
                select: {
                    email: true,
                    profile: true
                }
            },
            payment: true
        }
    });

    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, "Booking not found!");
    }

    // Check authorization
    if (user?.role !== UserRole.ADMIN && 
        booking.touristId !== user?.id && 
        booking.guideId !== user?.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You don't have access to this booking!");
    }

    return booking;
};

// ==================== UPDATE BOOKING STATUS ====================
const updateBookingStatus = async (
    bookingId: string,
    userEmail: string,
    status: BookingStatus,
    cancellationReason?: string
) => {
    const user = await prisma.user.findUnique({
        where: { email: userEmail }
    });

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });

    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, "Booking not found!");
    }

    // Authorization check
    if (status === BookingStatus.CONFIRMED || status === BookingStatus.REJECTED) {
        // Only guide can confirm or reject
        if (booking.guideId !== user?.id && user?.role !== UserRole.ADMIN) {
            throw new ApiError(httpStatus.FORBIDDEN, "Only the guide can confirm or reject bookings!");
        }
    }

    if (status === BookingStatus.CANCELLED) {
        // Tourist or admin can cancel
        if (booking.touristId !== user?.id && user?.role !== UserRole.ADMIN) {
            throw new ApiError(httpStatus.FORBIDDEN, "Only the tourist can cancel the booking!");
        }
    }

    const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status
        },
        include: {
            tour: true,
            tourist: {
                select: {
                    email: true,
                    profile: true
                }
            },
            guide: {
                select: {
                    email: true,
                    profile: true
                }
            }
        }
    });

    return updatedBooking;
};

export const BookingService = {
    createBooking,
    getAllBookings,
    getMyBookings,
    getGuideBookings,
    getBookingById,
    updateBookingStatus
};
