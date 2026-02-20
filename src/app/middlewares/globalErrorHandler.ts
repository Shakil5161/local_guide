import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"
import { Prisma } from "@prisma/client"
import config from "../../config"

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something went wrong!";
    let error = err;

    // Handle Prisma Errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            message = 'Duplicate entry! This record already exists.';
            statusCode = httpStatus.CONFLICT;
        } else if (err.code === 'P2025') {
            message = 'Record not found!';
            statusCode = httpStatus.NOT_FOUND;
        } else if (err.code === 'P2003') {
            message = 'Foreign key constraint failed!';
            statusCode = httpStatus.BAD_REQUEST;
        }
        error = {
            code: err.code,
            meta: err.meta
        };
    }

    // Handle Prisma Validation Errors
    if (err instanceof Prisma.PrismaClientValidationError) {
        message = 'Validation Error';
        statusCode = httpStatus.BAD_REQUEST;
        error = {
            details: err.message
        };
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token!';
        statusCode = httpStatus.UNAUTHORIZED;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Token expired!';
        statusCode = httpStatus.UNAUTHORIZED;
    }

    // Response
    res.status(statusCode).json({
        success,
        message,
        errorDetails: config.node_env === 'development' ? error : undefined,
        stack: config.node_env === 'development' ? err.stack : undefined
    })
};

export default globalErrorHandler;