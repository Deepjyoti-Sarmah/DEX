import { Response, Request, NextFunction} from "express"

interface AsyncHandler {
    (req: Request, res: Response, next: NextFunction): Promise<any>
}

const signupUser: AsyncHandler = async (req, res) => {


}

const loginUser = (req: any, res: any) => {

}

const addAssetUser = (req: any, res: any) => {

}

export {
    signupUser,
    loginUser,
    addAssetUser
}
