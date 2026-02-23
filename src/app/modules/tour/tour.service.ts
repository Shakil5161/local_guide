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
const updateTour = async (tourId: string, userEmail: string, payload: any) => {
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { profile: true }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    const tour = await prisma.tour.findUnique({ where: { id: tourId } });

    if (!tour) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tour not found!");
    }

    // Admins can update any tour; guides can only update their own
    if (user.role !== UserRole.ADMIN && tour.guideId !== user.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You can only update your own tours!");
    }

    const updatedTour = await prisma.tour.update({
        where: { id: tourId },
        data: payload,
        include: { guide: true }
    });

    return updatedTour;
};

// ==================== DELETE TOUR ====================
const deleteTour = async (tourId: string, userEmail: string) => {
    const user = await prisma.user.findUnique({
        where: { email: userEmail }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    const tour = await prisma.tour.findUnique({ where: { id: tourId } });

    if (!tour) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tour not found!");
    }

    // Admins can delete any tour; guides can only delete their own
    if (user.role !== UserRole.ADMIN && tour.guideId !== user.id) {
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

// ==================== GET AVAILABILITY ====================
const getAvailability = async (tourId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.tourAvailability.findMany({
        where: {
            tourId,
            date: { gte: today },
        },
        orderBy: { date: 'asc' },
    });
};

// ==================== SET AVAILABILITY ====================
const setAvailability = async (
    tourId: string,
    guideEmail: string,
    dates: { date: string; slots?: number }[]
) => {
    // Verify the tour belongs to this guide
    const tour = await prisma.tour.findFirst({
        where: { id: tourId, guide: { email: guideEmail } },
    });
    if (!tour) throw new ApiError(httpStatus.FORBIDDEN, "You don't own this tour.");

    if (!Array.isArray(dates) || dates.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please provide at least one date.");
    }

    // Upsert each date
    const results = await Promise.all(
        dates.map(({ date, slots }) => {
            const d = new Date(date);
            d.setUTCHours(12, 0, 0, 0); // Store as UTC noon to avoid timezone drift
            return prisma.tourAvailability.upsert({
                where: { tourId_date: { tourId, date: d } },
                create: { tourId, date: d, slots: slots ?? 1 },
                update: { slots: slots ?? 1 },
            });
        })
    );

    return results;
};

// ==================== DELETE AVAILABILITY DATE ====================
const deleteAvailabilityDate = async (
    tourId: string,
    availId: string,
    guideEmail: string
) => {
    const tour = await prisma.tour.findFirst({
        where: { id: tourId, guide: { email: guideEmail } },
    });
    if (!tour) throw new ApiError(httpStatus.FORBIDDEN, "You don't own this tour.");

    return prisma.tourAvailability.delete({ where: { id: availId } });
};

export const TourService = {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    getMyTours,
    getAvailability,
    setAvailability,
    deleteAvailabilityDate,
};
