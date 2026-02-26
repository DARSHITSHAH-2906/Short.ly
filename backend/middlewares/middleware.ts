import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpCodes } from '../utils/httpCodes.js';
import { TokenController } from '../token/token.controller.js';
import { ZodSchema } from 'zod/v3';

export class MiddleWares{
    constructor(private readonly tokenController: TokenController) {}

    async allowloginuser(req: Request, res: Response, next: NextFunction) {
        try {
            let user = await this.tokenController.getUser(req);
            if (!user) {
                user = await this.tokenController.refreshAccessToken(req, res);
            }
            if (!user) {
                return res.status(HttpCodes.UNAUTHORIZED).json({ message: "Unauthorized. Please log in again." });
            }
            req.user = user;
            next();

        } catch (error) {
            return res.status(HttpCodes.UNAUTHORIZED).json({ message: "Invalid session or token" });
        }
    }

    async allowPremiumUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as any;
            if (!user) {
                return res.status(HttpCodes.UNAUTHORIZED).json({ message: "Unauthorized. Please log in again." });
            }
            if (!['PRO', 'ENTERPRISE'].includes(user.subscriptionPlan || 'FREE')) {
                return res.status(HttpCodes.FORBIDDEN).json({ message: "Premium plan required to access this resource." });
            }
            next();
        } catch (error) {
            return res.status(HttpCodes.UNAUTHORIZED).json({ message: "Invalid session or token" });
        }
    }

    ValidateData = (schema : ZodSchema)=>{
        return async (req : Request, res : Response, next : NextFunction) => {
            try{
                const validateData : any = await schema.parseAsync({
                    body : req.body,
                    query : req.query,
                    params : req.params
                })
                req.body = validateData.body
                req.query = validateData.query
                req.params = validateData.params
                next()
            }catch(error: any){
                if(error instanceof ZodError || error.name === "ZodError"){
                    return res.status(HttpCodes.VALIDATION_CONFLICT).json({
                        status : "error",
                        message : "Validation Error",
                        errors : error.flatten().fieldErrors
                    })
                }
                res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                    status : "error",
                    message : "Internal Server Error"
                })
            }
        }
    }
}