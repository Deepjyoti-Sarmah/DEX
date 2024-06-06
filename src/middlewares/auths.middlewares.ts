import  jwt  from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { PrismaClient } from "@prisma/client";
import { RequestResponseHandler } from "../interfaces/requestResponses.interfaces";
import { AuthenticatedRequest } from "../interfaces/auths.interfaces";

const prisma = new PrismaClient();

const verifyJWT: RequestResponseHandler = async (req: AuthenticatedRequest, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log(token)

        if (!token) {
            throw new ApiError(401, "unauthorized request");
        }

        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new ApiError(500, "ACCESS_TOKEN_SECRET is not defined");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as {id: number}; 

        console.log(decodedToken)

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id },
            select: {
                id: true,
                username: true,
                email: true,
                assets: true
            }
        });

        console.log(user);

        if (!user) {
            throw new ApiError(401, "invalid access token");
        }

        req.user = user
        next();
    } catch (error: any) {
        res.status(error.code || 500).json(
            new ApiError(401, "invalid access token", [error.message])
        );
    }
}

export {
    verifyJWT
}
