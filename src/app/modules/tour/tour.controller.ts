import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { TourService } from "./tour.service";
import httpStatus from "http-status";

// ==================== CREATE TOUR ====================
const createTour = catchAsync(async (req: Request, res: Response) => {
    const result = await TourService.createTour(req.user!.email, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Tour created successfully!",
        data: result
    });
});

// ==================== GET ALL TOURS ====================
const getAllTours = catchAsync(async (req: Request, res: Response) => {
    const result = await TourService.getAllTours(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tours retrieved successfully!",
        meta: result.meta,
        data: result.data
    });
});

// ==================== GET TOUR BY ID ====================
const getTourById = catchAsync(async (req: Request, res: Response) => {
    const result = await TourService.getTourById(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour retrieved successfully!",
        data: result
    });
});

// ==================== UPDATE TOUR ====================
const updateTour = catchAsync(async (req: Request, res: Response) => {
    const result = await TourService.updateTour(req.params.id, req.user!.email, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour updated successfully!",
        data: result
    });
});

// ==================== DELETE TOUR ====================
const deleteTour = catchAsync(async (req: Request, res: Response) => {
    const result = await TourService.deleteTour(req.params.id, req.user!.email);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour deleted successfully!",
        data: result
    });
});

// ==================== GET MY TOURS ====================
const getMyTours = catchAsync(async (req: Request, res: Response) => {
    const result = await TourService.getMyTours(req.user!.email);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your tours retrieved successfully!",
        data: result
    });
});

export const TourController = {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    getMyTours
};
