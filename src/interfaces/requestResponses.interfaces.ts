import { Response, Request, NextFunction } from "express";

interface RequestResponseHandler {
    (req: Request, res: Response, next: NextFunction): Promise<any>;
}

export {
    RequestResponseHandler
}
