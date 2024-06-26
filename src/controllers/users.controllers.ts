import { UserZod } from "../zod/user.zod";
import { ApiError } from "../utils/ApiError";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "../utils/ApiResponse";
import { hashPassword, isPasswordCorrect } from "../utils/Password";
import { generateAccessToken, generateRefreshToken } from "../utils/Jwt";
import { RequestResponseHandler } from "../interfaces/requestResponses.interfaces";
import { AuthenticatedRequest } from "../interfaces/auths.interfaces";
import { AssetZod } from "../zod/asset.zod";

const prisma = new PrismaClient();

const generateAccessAndRefreshToken = async (userId: number) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId}
        });

        if (!user) {
            throw new ApiError(404, "user not found");
        }

        const accessToken = await generateAccessToken({
            userId: user.id,
            username: user.username,
            email: user.email
        });

        const refreshToken = await generateRefreshToken(user.id);

        await prisma.user.update({
            where: {id: user.id},
            data: {
                refreshToken: refreshToken,
            }
        });

        return { accessToken, refreshToken}
    } catch (error: any) {
        throw new ApiError(500, "something went wrong while generating access and refresh token", [error.message]);
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
    } catch (error: any) {
        return res.status(error.code || 500).json(
            new ApiError(500, "something went wrong while registering users", [error.message])
        );
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
    } catch (error: any) {
        return res.status(error.code || 500).json(
            new ApiError(500, "something went worng while logging user", [error.message])
        );
    }
};

const addAssetUser: RequestResponseHandler = async(req: AuthenticatedRequest, res) => {
    const user = req.user;
    const validateAsset = await AssetZod.parseAsync(req.body);
    const {eth, usdc} = validateAsset;

    if (!(eth || usdc)) {
        throw new ApiError(400,"please provide at least one asset (ETH or USDC)");
    }

    try {
        const existingAsset = await prisma.asset.findUnique({
            where: {userId: user?.id}
        });

        if (existingAsset) {
            const updateAsset = await prisma.asset.update({
                where: {id: existingAsset.id},
                data: {
                    eth: Number(existingAsset.eth) + eth,
                    usdc: Number(existingAsset.usdc) + usdc
                }
            });

            return res.status(200).json(
                new ApiResponse(200, updateAsset, "asset updated successfully")
            );
        } else {

            if (user?.id === undefined) {
                throw new ApiError(400, "userId is undefined");
            }

            const newAsset = await prisma.asset.create({
                data: {
                    userId: user?.id,
                    eth: eth,
                    usdc: usdc
                },
            });

            return res.status(201).json(
                new ApiResponse(201, newAsset, "asset created successfully")
            );
        }
    } catch (error: any) {
        return res.status(error.code || 500).json( 
            new ApiError(500, "something went wrong while adding asset", [error.message])
        );
    }
};

const getUserAsset: RequestResponseHandler = async(req: AuthenticatedRequest, res) => {
    const user = req.user;

    try {
        const userAsset = await prisma.asset.findUnique({
            where: {userId: user?.id}
        });

        if (!userAsset) {
            throw new ApiError(404, "user's asset doesn't exists");
        }

        return res.status(200).json(
            new ApiResponse(200, userAsset, "user's asset received successfully")
        );
    } catch (error: any) {
        return res.status(error.code || 500).json(
            new ApiError(500, "something went wrong while fetching user asset", [error.message])
        );
    }
}

export { signupUser, loginUser, addAssetUser, getUserAsset };
