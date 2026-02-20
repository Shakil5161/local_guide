import { BookingStatus, UserRole } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

// ==================== CREATE REVIEW ====================
const createReview = async (touristEmail: string, payload: any) => {
    // Get tourist
    const tourist = await prisma.user.findUnique({
        where: { email: touristEmail }
    });

    if (!tourist || tourist.role !== UserRole.TOURIST) {
        throw new ApiError(httpStatus.FORBIDDEN, "Only tourists can create reviews!");
    }

    // Check if booking exists and belongs to tourist
    const booking = await prisma.booking.findUnique({
        where: { id: payload.bookingId },
        include: { tour: true }
    });

    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, "Booking not found!");
    }

    if (booking.touristId !== tourist.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You can only review your own bookings!");
    }

    if (booking.status !== BookingStatus.COMPLETED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "You can only review completed bookings!");
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
        where: {
            tourId: booking.tourId,
            userId: tourist.id
        }
    });

    if (existingReview) {
        throw new ApiError(httpStatus.BAD_REQUEST, "You have already reviewed this booking!");
    }

    // Validate rating
    if (payload.rating < 1 || payload.rating > 5) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5!");
    }

    // Create review
    const review = await prisma.review.create({
        data: {
            tourId: booking.tourId,
            userId: tourist.id,
            rating: payload.rating,
            comment: payload.comment
        },
        include: {
            user: {
                select: {
                    email: true,
                    profile: {
                        select: {
                            name: true,
                            profilePicture: true
                        }
                    }
                }
            },
            tour: {
                select: {
                    title: true,
                    guide: {
                        select: {
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

    return review;
};

// ==================== GET REVIEWS FOR TOUR ====================
const getReviewsForTour = async (tourId: string) => {
    const reviews = await prisma.review.findMany({
        where: { tourId },
        include: {
            user: {
                select: {
                    email: true,
                    profile: {
                        select: {
                            name: true,
                            profilePicture: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviews.length
        : 0;

    return {
        reviews,
        averageRating: avgRating,
        totalReviews: reviews.length
    };
};

// ==================== GET REVIEWS BY TOURIST ====================
const getReviewsByTourist = async (touristEmail: string) => {
    const tourist = await prisma.user.findUnique({
        where: { email: touristEmail }
    });

    if (!tourist) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tourist not found!");
    }

    const reviews = await prisma.review.findMany({
        where: { userId: tourist.id },
        include: {
            tour: {
                select: {
                    title: true,
                    city: true,
                    guide: {
                        select: {
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

    return reviews;
};

// ==================== UPDATE REVIEW ====================
const updateReview = async (reviewId: string, touristEmail: string, payload: any) => {
    const tourist = await prisma.user.findUnique({
        where: { email: touristEmail }
    });

    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, "Review not found!");
    }

    if (review.userId !== tourist?.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You can only update your own reviews!");
    }

    // Validate rating if provided
    if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5!");
    }

    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
            rating: payload.rating,
            comment: payload.comment
        },
        include: {
            user: {
                select: {
                    email: true,
                    profile: {
                        select: {
                            name: true,
                            profilePicture: true
                        }
                    }
                }
            },
            tour: {
                select: {
                    title: true
                }
            }
        }
    });

    return updatedReview;
};

// ==================== DELETE REVIEW ====================
const deleteReview = async (reviewId: string, touristEmail: string) => {
    const tourist = await prisma.user.findUnique({
        where: { email: touristEmail }
    });

    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, "Review not found!");
    }

    if (review.userId !== tourist?.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You can only delete your own reviews!");
    }

    await prisma.review.delete({
        where: { id: reviewId }
    });

    return { message: "Review deleted successfully" };
};

export const ReviewService = {
    createReview,
    getReviewsForTour,
    getReviewsByTourist,
    updateReview,
    deleteReview
};
