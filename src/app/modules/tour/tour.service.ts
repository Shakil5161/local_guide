import { Prisma, TourCategory, UserRole } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

// ==================== CREATE TOUR ====================
const createTour = async (guideEmail: string, payload: any) => {
    // Get guide profile
    const guide = await prisma.user.findUnique({
        where: { email: guideEmail },
        include: { profile: true }
    });

    if (!guide || guide.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.FORBIDDEN, "Only guides can create tours!");
    }

    if (!guide.profile) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please complete your profile first!");
    }

    const location = payload.location || [payload.city, payload.country].filter(Boolean).join(", ");
    if (!location) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Location is required!");
    }

    const tour = await prisma.tour.create({
        data: {
            title: payload.title,
            description: payload.description,
            category: payload.category,
            price: payload.price,
            duration: payload.duration,
            maxGroupSize: payload.maxGroupSize,
            location,
            city: payload.city,
            country: payload.country,
            meetingPoint: payload.meetingPoint,
            images: payload.images ?? [],
            included: payload.included ?? [],
            excluded: payload.excluded ?? [],
            isActive: payload.isActive ?? true,
            guideId: guide.id
        },
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
    });

    return tour;
};

// ==================== GET ALL TOURS ====================
const getAllTours = async (params: any) => {
    const {
        page = 1,
        limit = 10,
        searchTerm,
        city,
        country,
        category,
        minPrice,
        maxPrice,
        language
    } = params;

    const skip = (Number(page) - 1) * Number(limit);

    const whereConditions: Prisma.TourWhereInput = {
        isActive: true
    };

    if (searchTerm) {
        whereConditions.OR = [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { city: { contains: searchTerm, mode: 'insensitive' } }
        ];
    }

    if (city) {
        whereConditions.city = { contains: city, mode: 'insensitive' };
    }

    if (country) {
        whereConditions.country = { contains: country, mode: 'insensitive' };
    }

    if (category) {
        whereConditions.category = category as TourCategory;
    }

    if (minPrice || maxPrice) {
        whereConditions.price = {};
        if (minPrice) whereConditions.price.gte = Number(minPrice);
        if (maxPrice) whereConditions.price.lte = Number(maxPrice);
    }

    if (language) {
        whereConditions.guide = {
            profile: {
                languages: { has: language }
            }
        };
    }

    const tours = await prisma.tour.findMany({
        where: whereConditions,
        skip,
        take: Number(limit),
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
            },
            _count: {
                select: {
                    reviews: true,
                    bookings: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const total = await prisma.tour.count({ where: whereConditions });

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total
        },
        data: tours
    };
};

// ==================== GET TOUR BY ID ====================
const getTourById = async (id: string) => {
    const tour = await prisma.tour.findUnique({
        where: { id },
        include: {
            guide: {
                include: {
                    profile: {
                        select: {
                            name: true,
                            profilePicture: true,
                            city: true,
                            country: true
                        }
                    }
                }
            },
            reviews: {
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
            },
            _count: {
                select: {
                    bookings: true
                }
            }
        }
    });

    if (!tour) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tour not found!");
    }

    // Calculate average rating
    const avgRating = tour.reviews.length > 0
        ? tour.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / tour.reviews.length
        : 0;

    return { ...tour, averageRating: avgRating };
};

// ==================== UPDATE TOUR ====================
const updateTour = async (tourId: string, guideEmail: string, payload: any) => {
    // Get guide
    const guide = await prisma.user.findUnique({
        where: { email: guideEmail },
        include: { profile: true }
    });

    if (!guide || !guide.profile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Guide not found!");
    }

    // Check if tour belongs to guide
    const tour = await prisma.tour.findUnique({
        where: { id: tourId }
    });

    if (!tour) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tour not found!");
    }

    if (tour.guideId !== guide.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You can only update your own tours!");
    }

    const updatedTour = await prisma.tour.update({
        where: { id: tourId },
        data: payload,
        include: {
            guide: true
        }
    });

    return updatedTour;
};

// ==================== DELETE TOUR ====================
const deleteTour = async (tourId: string, guideEmail: string) => {
    const guide = await prisma.user.findUnique({
        where: { email: guideEmail },
        include: { profile: true }
    });

    if (!guide || !guide.profile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Guide not found!");
    }

    const tour = await prisma.tour.findUnique({
        where: { id: tourId }
    });

    if (!tour) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tour not found!");
    }

    if (tour.guideId !== guide.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You can only delete your own tours!");
    }

    // Soft delete by setting isActive to false
    const deletedTour = await prisma.tour.update({
        where: { id: tourId },
        data: { isActive: false }
    });

    return deletedTour;
};

// ==================== GET MY TOURS (GUIDE) ====================
const getMyTours = async (guideEmail: string) => {
    const guide = await prisma.user.findUnique({
        where: { email: guideEmail },
        include: { profile: true }
    });

    if (!guide || !guide.profile) {
        throw new ApiError(httpStatus.NOT_FOUND, "Guide not found!");
    }

    const tours = await prisma.tour.findMany({
        where: { guideId: guide.id },
        include: {
            _count: {
                select: {
                    reviews: true,
                    bookings: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return tours;
};

export const TourService = {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    getMyTours
};
