import { Request } from "express";
import { User } from "@prisma/client";
import { Omit } from "@prisma/client/runtime/library";

type PartialUser = Omit<User, "password" | "refreshToken">;

interface AuthenticatedRequest extends Request {
    user?: PartialUser
}

export {
    AuthenticatedRequest
}
