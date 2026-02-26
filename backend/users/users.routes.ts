import express from "express"
import { MiddleWares } from "../middlewares/middleware.js"
import { UserController } from "./user.controller.js"

export class UserRouter{
    router : express.Router
    constructor(private readonly middlewares : MiddleWares, private readonly userController : UserController){
        this.router = express.Router()
        this.intitialiseRoutes()
    }

    intitialiseRoutes(){
        this.router.get('/urls' , (req, res, next) => this.middlewares.allowloginuser(req, res, next) , (req, res) => this.userController.fetchUrls(req, res))
    }
}