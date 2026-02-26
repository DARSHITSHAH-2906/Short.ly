import { UserService } from "./users.service.js";
import { Request, Response } from "express";

export class UserController{
    constructor(private readonly userService : UserService){}

    async fetchUrls(req : Request, res: Response){
        try {
            const user = req.user;
            if(!user){
                return res.status(401).json({status : "error" , message : "Unauthorized"})
            }
            const urls = await this.userService.fetchUrls(user.sub)
            return res.status(200).json({status : "success" , urls : urls})
        } catch (error: any) {
            if(error.code === 404){
                return res.status(404).json({status : "error" , message : "No User Found"})
            }
            return res.status(500).json({status : "error" , message : "Internal Server Error"})
        }
    }
}