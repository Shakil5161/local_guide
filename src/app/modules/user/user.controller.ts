import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";

// ==================== GET ALL USERS ====================
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getAllUsers(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully!",
        meta: result.meta,
        data: result.data
    });
});

// ==================== GET USER BY ID ====================
const getUserById = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getUserById(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrieved successfully!",
        data: result
    });
});

// ==================== UPDATE PROFILE ====================
const updateProfile = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.email) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    const user = await prisma.user.findUnique({
        where: { email: req.user.email },
        select: { id: true }
    });

    if (!user?.id) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    const requestedUserId = req.params.id;
    const isAdmin = req.user.role === "ADMIN";
    const targetUserId = requestedUserId || user.id;

    if (requestedUserId && !isAdmin && requestedUserId !== user.id) {
        throw new ApiError(httpStatus.FORBIDDEN, "You can only update your own profile!");
    }

    const result = await UserService.updateProfile(targetUserId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully!",
        data: result
    });
});

// ==================== UPDATE USER STATUS ====================
const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.updateUserStatus(req.params.id, req.body.status);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User status updated successfully!",
        data: result
    });
});

// ==================== DELETE USER ====================
const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.deleteUser(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User deleted successfully!",
        data: result
    });
});

// ==================== GET GUIDES ====================
const getGuides = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getGuides(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Guides retrieved successfully!",
        meta: result.meta,
        data: result.data
    });
});

export const UserController = {
    getAllUsers,
    getUserById,
    updateProfile,
    updateUserStatus,
    deleteUser,
    getGuides
};
