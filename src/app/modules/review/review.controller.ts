import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ReviewService } from "./review.service";
import httpStatus from "http-status";

const createReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.createReview(req.user!.email, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Review created successfully!",
        data: result
    });
});

const getReviewsForTour = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.getReviewsForTour(req.params.tourId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Reviews retrieved successfully!",
        data: result
    });
});

const getReviewsByTourist = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.getReviewsByTourist(req.user!.email);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your reviews retrieved successfully!",
        data: result
    });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.updateReview(req.params.id, req.user!.email, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review updated successfully!",
        data: result
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.deleteReview(req.params.id, req.user!.email);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review deleted successfully!",
        data: result
    });
});

export const ReviewController = {
    createReview,
    getReviewsForTour,
    getReviewsByTourist,
    updateReview,
    deleteReview
};
