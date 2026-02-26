import jwt from 'jsonwebtoken';
import { IUser } from '../users/models/user.js';
import { CookieToken, IPayload } from './token.controller.js';
import dotenv from 'dotenv';
dotenv.config();

export class TokenService {
    private accessSecret: string;
    private refreshSecret: string;
    private ACCESS_TOKEN_EXPIRY: number;
    private REFRESH_TOKEN_EXPIRY: number;

    constructor() {
        this.accessSecret = process.env.JWT_ACCESS_SECRET as string
        this.refreshSecret = process.env.JWT_REFRESH_SECRET as string
        this.ACCESS_TOKEN_EXPIRY = parseInt(process.env.ACCESS_TOKEN_EXPIRY as string) || 15 * 60 * 1000;
        this.REFRESH_TOKEN_EXPIRY = parseInt(process.env.REFRESH_TOKEN_EXPIRY as string) || 7 * 24 * 60 * 60 * 1000;
    }

    generateTokens(user: IUser): CookieToken[] {
        const payload: IPayload = {
            sub: user._id.toString(),
            email: user.email,
            subscriptionPlan: user.subscriptionPlan || 'FREE'
        };

        const accessToken = jwt.sign(payload, this.accessSecret, { expiresIn: `${this.ACCESS_TOKEN_EXPIRY/1000}s` });
        const refreshToken = jwt.sign(payload, this.refreshSecret, { expiresIn: `${this.REFRESH_TOKEN_EXPIRY/1000}s` });

        return [
            { name: 'access_token', value: accessToken },
            { name: 'refresh_token', value: refreshToken }
        ];
    }

    refreshAccessToken(refreshToken: string): { payload: IPayload, tokens: CookieToken[] } | null {
        const decoded = jwt.verify(refreshToken, this.refreshSecret) as IPayload;
        if(!decoded){
            return null;
        }

        const payload: IPayload = {
            sub: decoded.sub,
            email: decoded.email,
            subscriptionPlan: decoded.subscriptionPlan
        };

        const newAccessToken = jwt.sign(payload, this.accessSecret, { expiresIn: `${this.ACCESS_TOKEN_EXPIRY/1000}s` });
        const tokens : CookieToken[] = [{ name: "access_token", value: newAccessToken }]
        return { payload, tokens };
    }


}