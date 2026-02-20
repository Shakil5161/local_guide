import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { BookingService } from "./booking.service";
import httpStatus from "http-status";

// ==================== CREATE BOOKING ====================
const createBooking = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.createBooking(req.user!.email, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Booking created successfully!",
        data: result
    });
});

// ==================== GET ALL BOOKINGS ====================
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.getAllBookings(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Bookings retrieved successfully!",
        meta: result.meta,
        data: result.data
    });
});

// ==================== GET MY BOOKINGS ====================
const getMyBookings = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.getMyBookings(req.user!.email);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your bookings retrieved successfully!",
        data: result
    });
});

// ==================== GET GUIDE BOOKINGS ====================
const getGuideBookings = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.getGuideBookings(req.user!.email);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Guide bookings retrieved successfully!",
        data: result
    });
});

// ==================== GET BOOKING BY ID ====================
const getBookingById = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.getBookingById(req.params.id, req.user!.email);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking retrieved successfully!",
        data: result
    });
});

// ==================== UPDATE BOOKING STATUS ====================
const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.updateBookingStatus(
        req.params.id,
        req.user!.email,
        req.body.status,
        req.body.cancellationReason
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking status updated successfully!",
        data: result
    });
});

export const BookingController = {
    createBooking,
    getAllBookings,
    getMyBookings,
    getGuideBookings,
    getBookingById,
    updateBookingStatus
};
