import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

// ==================== GET ALL USERS (ADMIN) ====================
const getAllUsers = async (params: any) => {
    const { page = 1, limit = 10, searchTerm, role, status } = params;
    const skip = (Number(page) - 1) * Number(limit);

    const whereConditions: Prisma.UserWhereInput = {};

    if (searchTerm) {
        whereConditions.OR = [
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { profile: { name: { contains: searchTerm, mode: 'insensitive' } } }
        ];
    }

    if (role) {
        whereConditions.role = role;
    }

    if (status) {
        whereConditions.status = status;
    }

    const users = await prisma.user.findMany({
        where: whereConditions,
        skip,
        take: Number(limit),
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            profile: {
                select: {
                    name: true,
                    profilePicture: true,
                    city: true,
                    country: true,
                    phone: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const total = await prisma.user.count({ where: whereConditions });

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total
        },
        data: users
    };
};

// ==================== GET USER BY ID ====================
const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            profile: true
        }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    return user;
};

// ==================== UPDATE PROFILE ====================
const updateProfile = async (userId: string, payload: any) => {
    if (!userId || typeof userId !== "string") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user id!");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: payload,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true
                }
            }
        }
    });

    return updatedProfile;
};

// ==================== UPDATE USER STATUS (ADMIN) ====================
const updateUserStatus = async (userId: string, status: string) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { status: status as any },
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            profile: {
                select: {
                    name: true
                }
            }
        }
    });

    return user;
};

// ==================== DELETE USER (ADMIN) ====================
const deleteUser = async (userId: string) => {
    // Soft delete by updating status
    const user = await prisma.user.update({
        where: { id: userId },
        data: { status: 'DELETED' },
        select: {
            id: true,
            email: true,
            status: true
        }
    });

    return user;
};

// ==================== GET GUIDES ====================
const getGuides = async (params: any) => {
    const { page = 1, limit = 10, city, language, expertise } = params;
    const skip = (Number(page) - 1) * Number(limit);

    const whereConditions: Prisma.ProfileWhereInput = {
        user: {
            role: UserRole.GUIDE,
            status: 'ACTIVE'
        }
    };

    if (city) {
        whereConditions.city = { contains: city, mode: 'insensitive' };
    }

    if (language) {
        whereConditions.languages = { has: language };
    }

    if (expertise) {
        whereConditions.expertise = { has: expertise };
    }

    const guides = await prisma.profile.findMany({
        where: whereConditions,
        skip,
        take: Number(limit),
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    _count: {
                        select: {
                            toursAsGuide: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const total = await prisma.profile.count({ where: whereConditions });

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total
        },
        data: guides
    };
};

export const UserService = {
    getAllUsers,
    getUserById,
    updateProfile,
    updateUserStatus,
    deleteUser,
    getGuides
};
