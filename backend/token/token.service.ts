import jwt from 'jsonwebtoken';
import { IUser } from '../users/models/user.js';
import { CookieToken, IPayload } from './token.controller.js';
import dotenv from 'dotenv';
dotenv.config();

export class TokenService {
    private accessSecret: string;
    private refreshSecret: string;

    constructor() {
        this.accessSecret = process.env.JWT_ACCESS_SECRET || "default_access_secret";
        this.refreshSecret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";
    }

    generateTokens(user: IUser): CookieToken[] {
        const payload: IPayload = {
            sub: user._id.toString(),
            email: user.email,
            subscriptionPlan: user.subscriptionPlan || 'FREE'
        };

        const accessToken = jwt.sign(payload, this.accessSecret, { expiresIn: "1m" });
        const refreshToken = jwt.sign(payload, this.refreshSecret, { expiresIn: "7d" });

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

        const newAccessToken = jwt.sign(payload, this.accessSecret, { expiresIn: "1m" });
        const tokens : CookieToken[] = [{ name: "access_token", value: newAccessToken }]
        return { payload, tokens };
    }


}