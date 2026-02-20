import { UserRole, UserStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import { Secret } from "jsonwebtoken"
import config from "../../../config"
import ApiError from "../../errors/ApiError"
import { jwtHelper } from "../../helper/jwtHelper"
import { prisma } from "../../shared/prisma"
import httpStatus from "http-status"

// ==================== REGISTER ====================
const register = async (payload: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
    phone?: string;
    city?: string;
    country?: string;
}) => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: payload.email }
    });

    if (existingUser) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User already exists with this email!");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 12);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
            data: {
                email: payload.email,
                password: hashedPassword,
                role: payload.role,
                status: UserStatus.ACTIVE
            }
        });

        // Create profile
        const profile = await tx.profile.create({
            data: {
                userId: user.id,
                name: payload.name,
                phone: payload.phone,
                city: payload.city,
                country: payload.country,
                languages: [],
                expertise: [],
                travelPreferences: []
            }
        });

        return { user, profile };
    });

    // Generate tokens
    const accessToken = jwtHelper.generateToken(
        { email: result.user.email, role: result.user.role },
        config.jwt_secret as Secret,
        "10h"
    );

    const refreshToken = jwtHelper.generateToken(
        { email: result.user.email, role: result.user.role },
        config.jwt_secret as Secret,
        "30d"
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            profile: result.profile
        }
    };
};

// ==================== LOGIN ====================
const login = async (payload: {email: string, password: string}) => {
  
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    })

    const isCorrectPassword = await bcrypt.compare(payload.password, user.password)
    if(!isCorrectPassword){
        throw new ApiError(403,"Password is incorrect!")
    }
    
    const accessToken = jwtHelper.generateToken({email: user.email, role: user.role}, config.jwt_secret as Secret,"10h")

    const refreshToken = jwtHelper.generateToken({email: user.email, role: user.role}, config.jwt_secret as Secret, "30d")

    return {
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange
    }

}


const refreshToken = async (token: string) => {
    let decodedData;
    try {
        decodedData = jwtHelper.verifyToken(token, config.jwt_secret as Secret);
    }
    catch (err) {
        throw new Error("You are not authorized!")
    }

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        }
    });

    const accessToken = jwtHelper.generateToken({
        email: userData.email,
        role: userData.role
    },
        config.jwt_secret as Secret,
        "10h"
    );

    return {
        accessToken,
        needPasswordChange: userData.needPasswordChange
    };

};


const getMe = async (session: any) => {
    if (!session?.email) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: session.email,
            status: UserStatus.ACTIVE
        }
    })

    const { id, email, role, needPasswordChange, status } = userData;

    return {
        id,
        email,
        role,
        needPasswordChange,
        status
    }

}


export const AuthService = {
    register,
    login,
    refreshToken,
    getMe
}