import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../errors/ApiError';
import { jwtHelper } from '../helper/jwtHelper';
import { UserRole } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';

type AuthJwtPayload = JwtPayload & {
    email: string;
    role: UserRole;
};

const isAuthJwtPayload = (payload: JwtPayload): payload is AuthJwtPayload => {
    return (
        typeof payload.email === 'string' &&
        typeof payload.role === 'string' &&
        Object.values(UserRole).includes(payload.role as UserRole)
    );
};

const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authorization = req.headers.authorization;
            const token = authorization?.startsWith('Bearer ')
                ? authorization.split(' ')[1]
                : authorization;

            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
            }

            const verifiedUser = jwtHelper.verifyToken(token, config.jwt_secret as Secret);
            if (!isAuthJwtPayload(verifiedUser)) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token payload!');
            }

            req.user = verifiedUser;

            // Check if user has required role
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden access!');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default auth;
