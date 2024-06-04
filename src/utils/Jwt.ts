import  jwt  from "jsonwebtoken";

interface TokenPayload {
    userId: number;
    username: string;
    email: string;
}

const generateAccessToken = (payload: TokenPayload): string => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }

    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_SECRET,
    });
}

const generateRefreshToken = (userId: number): string => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined");
    }

    return jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_SECRET,
    });
}

export {
    generateAccessToken,
    generateRefreshToken
}
