import { Request, Response } from "express";
import { HttpCodes } from "../utils/httpCodes.js";
import { TokenService } from "./token.service.js";
import jwt from 'jsonwebtoken';
const { TokenExpiredError } = jwt
import dotenv from 'dotenv';
dotenv.config();

export interface CookieToken {
    name: 'access_token' | 'refresh_token';
    value: string;
}
export interface IPayload {
    sub: string;
    email: string;
    subscriptionPlan: string;
}

export class TokenController {
    private isProduction: boolean;
    private accessSecret: string;
    private refreshSecret: string;
    private ACCESS_TOKEN_EXPIRY: number;
    private REFRESH_TOKEN_EXPIRY: number;

    constructor(private readonly tokenService: TokenService) {
        this.accessSecret = process.env.JWT_ACCESS_SECRET as string
        this.refreshSecret = process.env.JWT_REFRESH_SECRET as string;
        this.isProduction = process.env.NODE_ENV === 'production';
        this.ACCESS_TOKEN_EXPIRY = parseInt(process.env.ACCESS_TOKEN_EXPIRY as string) || 15 * 60 * 1000; // default 15 minutes
        this.REFRESH_TOKEN_EXPIRY = parseInt(process.env.REFRESH_TOKEN_EXPIRY as string) || 7 * 24 * 60 * 60 * 1000; // default 7 days
    }

    async removeTokens(req: Request, res: Response) {
        try {
            const access_token = req.cookies?.access_token;
            const refresh_token = req.cookies?.refresh_token;

            if (!access_token && !refresh_token) {
                throw { code: HttpCodes.ALREADY_LOGOUT, message: "User is already logged out" }
            }
            res.clearCookie('access_token', { httpOnly: true, secure: this.isProduction, sameSite: "lax" });
            res.clearCookie('refresh_token', { httpOnly: true, secure: this.isProduction, sameSite: "lax" });
        } catch (error) {
            throw error;
        }
    }

    saveTokens(tokens: CookieToken[], res: Response): void {
        for (const token of tokens) {
            res.cookie(token.name, token.value, {
                httpOnly: true,
                secure: this.isProduction,
                sameSite: "lax",
                maxAge: token.name === "refresh_token" ? this.REFRESH_TOKEN_EXPIRY : this.ACCESS_TOKEN_EXPIRY
            });
        }
    }
    async refreshAccessToken(req: Request, res: Response): Promise<IPayload | null> {
        try {
            const refreshToken = req.cookies?.refresh_token;
            if (!refreshToken) return null;
            const decoded = this.tokenService.refreshAccessToken(refreshToken);
            if (!decoded) throw new Error("Invalid refresh token");

            const { payload, tokens } = decoded
            this.saveTokens(tokens, res);
            return payload;

        } catch (error) {
            res.clearCookie('access_token', { httpOnly: true, secure: this.isProduction, sameSite: "lax" });
            res.clearCookie('refresh_token', { httpOnly: true, secure: this.isProduction, sameSite: "lax" });
            return null;
        }
    }

    async getUser(req: Request): Promise<IPayload | null> {
        try {
            const token = req.cookies?.access_token;
            if (!token) return null;

            return jwt.verify(token, this.accessSecret) as IPayload;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                return null;
            }
            throw error;
        }
    }
}