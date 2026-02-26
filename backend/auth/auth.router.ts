import express from "express";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { MiddleWares } from "../middlewares/middleware.js";
import { SignupSchema } from "./validation/signup.schema.js";
import { LoginSchema } from "./validation/login.schema.js";

export class AuthRouter {
    router: express.Router;
    constructor(private readonly authService : AuthService , private readonly authController: AuthController, private readonly middlewares: MiddleWares) {
        this.router = express.Router()
        this.InitializeRoutes()
    }

    InitializeRoutes() {
        this.router.post('/register', this.middlewares.ValidateData(SignupSchema), (req, res) => this.authController.signup(req, res))
        this.router.post('/login', this.middlewares.ValidateData(LoginSchema), (req, res) => this.authController.login(req, res))
        this.router.get('/verify-token', (req, res) => this.authController.verify(req, res))
        this.router.get('/refresh-token', (req, res) => this.authController.refreshToken(req, res))
        this.router.get('/logout' , (req, res) => this.authController.logout(req, res))
    }
}
