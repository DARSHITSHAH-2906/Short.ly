import { Request, Response } from "express";
import { TokenController } from "../token/token.controller.js";
import { HttpCodes } from "../utils/httpCodes.js";
import { AuthService } from "./auth.service.js";
import jwt from "jsonwebtoken";
const { JsonWebTokenError } = jwt;
export class AuthController {
    constructor(private readonly tokenController: TokenController, private readonly authService: AuthService) { }

    async logout(req: Request, res: Response) {
        try {
            await this.tokenController.removeTokens(req, res);
            res.status(HttpCodes.LOGOUT_SUCCESS).json({ status: "success", message: "Logout successful" })
        } catch (error: any) {
            if (error.code === HttpCodes.ALREADY_LOGOUT) {
                return res.status(HttpCodes.ALREADY_LOGOUT).json({ status: "success", message: "User is already logged out" })
            }
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" })
        }
    }

    async signup(req: Request, res: Response) {
        try {
            const data = req.body;
            const { newuser, tokens } = await this.authService.signup(data);

            this.tokenController.saveTokens(tokens, res);

            res.status(201).json({
                status: "success",
                message: "Registration Successful",
                user: { id: newuser._id, name: newuser.name, email: newuser.email, subscriptionPlan: newuser.subscriptionPlan }
            });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(HttpCodes.EMAIL_ALREADY_EXIST).json({ status: "error", message: "Email already exists" });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const data = req.body;
            const { loginuser, tokens } = await this.authService.login(data);

            this.tokenController.saveTokens(tokens, res);

            return res.status(HttpCodes.SUCCESS).json({ status: "success", message: "Login Successful", user: { id: loginuser._id, name: loginuser.name, email: loginuser.email, subscriptionPlan: loginuser.subscriptionPlan } });
        } catch (error: any) {
            if (error.code === HttpCodes.INVALID_CREDENTIALS) {
                return res.status(HttpCodes.INVALID_CREDENTIALS).json({ status: "error", message: "Invalid email or password" });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal Server Error" });
        }
    }

    async verify(req: Request, res: Response) {
        try {
            let user = await this.tokenController.getUser(req)
            if (!user) {
                return res.status(HttpCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
            }
            const foundUser = await this.authService.verify(user);
            if (!foundUser) {
                return res.status(HttpCodes.USER_NOT_FOUND).json({ message: "User not found" });
            }
            return res.status(HttpCodes.SUCCESS).json({ status: "success", message: "Token Verified", user: { id: foundUser._id, name: foundUser.name, email: foundUser.email, subscriptionPlan: foundUser.subscriptionPlan } });

        } catch (error) {
            if (error instanceof JsonWebTokenError) {
                return res.status(HttpCodes.UNAUTHORIZED).json({ message: "Invalid or Tampered token" });
            }
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal Server Error" });
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const user = await this.tokenController.refreshAccessToken(req, res);
            if (!user) {
                return res.status(HttpCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
            }
            const foundUser = await this.authService.refreshToken(user);
            if (!foundUser) {
                return res.status(HttpCodes.USER_NOT_FOUND).json({ message: "User not found" });
            }
            return res.status(HttpCodes.SUCCESS).json({ status: "success", message: "Token Refreshed", user: { id: foundUser._id, name: foundUser.name, email: foundUser.email, subscriptionPlan: foundUser.subscriptionPlan } });
        } catch (error) {
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal Server Error" });
        }
    }
}