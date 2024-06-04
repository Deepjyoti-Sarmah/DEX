import { Response, Request, NextFunction } from "express";
import { UserZod } from "../zod/user.zod";
import { ApiError } from "../utils/ApiError";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "../utils/ApiResponse";
import { hashPassword, isPasswordCorrect } from "../utils/Password";
import { generateAccessToken, generateRefreshToken } from "../utils/Jwt";

interface RequestResponseHandler {
    (req: Request, res: Response, next: NextFunction): Promise<any>;
}

const prisma = new PrismaClient();

const generateAccessAndRefreshToken = async (userId: number) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId}
        });
        if (!user) {
            throw new ApiError(404, "user not found");
        }

        const accessToken = generateAccessToken({
            userId: user.id,
            username: user.username,
            email: user.email
        });

        const refreshToken = generateRefreshToken(user.id);

        await prisma.user.update({
            where: {id: user.id},
            data: {
                refreshToken: refreshToken,
            }
        });

        return { accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token");
    }
}

const signupUser: RequestResponseHandler = async (req, res) => {
    const validateUser = await UserZod.parseAsync(req.body);
    const { username, email, password } = validateUser;

    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    try {
        const existUser = await prisma.user.findFirst({
            where: {
                OR: [{ username: username }, { email: email }],
            },
        });

        if (existUser) {
            throw new ApiError(409, "User with username or email already exists");
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword,
            },
        });

        return res
            .status(200)
            .json(new ApiResponse(200, user, "User registered successfully"));
    } catch (error) {
        throw new ApiError(500, "something went wrong while registering users");
    }
};

const loginUser: RequestResponseHandler = async (req, res) => {
    const validateUser = await UserZod.parseAsync(req.body);
    const {username, email, password} = validateUser;

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required");
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{username: username}, {email: email}]
            }
        });

        if (!user) {
            throw new ApiError(404,"user doesn't exists");
        }

        const isPasswordValid = await isPasswordCorrect(password, user.password);
        if (!isPasswordValid) {
            throw new ApiError(401, "invalid user credentials");
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user.id);
        
        const options = {
            httpOnly: true,
            secure: false
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {accessToken, refreshToken}, "user logged in successfully")
            );
    } catch (error) {
        return new ApiError(500, "something went worng while logging user");
    }
};

const addAssetUser = (req: any, res: any) => {};

export { signupUser, loginUser, addAssetUser };
