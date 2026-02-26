import mongoose from "mongoose";
import { User, IUser } from "./models/user.js";
import bcrypt from "bcrypt";
import { UrlService } from "../url/url.service.js";
import { HttpCodes } from "../utils/httpCodes.js";
import { SignUpInput } from "../auth/validation/signup.schema.js";
import { LoginInput } from "../auth/validation/login.schema.js";


export class UserService {
    constructor(private readonly urlService: UrlService) { }

    async createUser(user: SignUpInput): Promise<IUser> {
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
            throw { code: 11000, message: "Email already exists" };
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password || "", salt);
        const newUser = new User({ ...user, password: hashedPassword });
        return await newUser.save();

    }

    async loginUser(credentials: LoginInput): Promise<IUser | null> {
        try {
            const user = await User.findOne({ email: credentials.email });
            if (!user) {
                return null;
            }
            const isMatch = await bcrypt.compare(credentials.password, user.password || "");
            if (!isMatch) {
                return null;
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    async findUserById(id: string): Promise<IUser | null> {
        try {
            const _id = new mongoose.Types.ObjectId(id)
            return await User.findById(_id).select("-password");
        } catch (error) {
            throw error;
        }
    }

    async updateRefreshToken(id: mongoose.Types.ObjectId, refreshToken: string | undefined): Promise<void> {
        try {
            if (!refreshToken) {
                await User.findByIdAndUpdate(id, { refreshToken: null, expiresAt: null });
                return;
            }
            const salt = await bcrypt.genSalt(10);
            const hashedToken = await bcrypt.hash(refreshToken, salt);
            await User.findByIdAndUpdate(id, { refreshToken: hashedToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        } catch (error) {
            throw error;
        }
    }

    async fetchUrls(id: string) {
        const user = await this.findUserById(id);
        if (!user) {
            throw { code: HttpCodes.USER_NOT_FOUND, message: "User Not Found" }
        }
        const urls = await this.urlService.fetchUrls(user._id)
        return urls;
    }

    async getAvailableCredits(userId: string) {
        const user = await User.findById(userId);
        if (!user) {
            throw { code: HttpCodes.USER_NOT_FOUND, message: "User Not Found" }
        }
        return user.availableCredits;
    }

    async decreaseCredits(userId: string) {
        const user = await User.findById(userId);
        if (!user) {
            throw { code: HttpCodes.USER_NOT_FOUND, message: "User Not Found" }
        }
        user.availableCredits -= 1;
        await user.save();
    }

    async getSubscriptionPlan(userId: mongoose.Types.ObjectId) {
        const user = await User.findById(userId);
        if (!user) {
            throw { code: HttpCodes.USER_NOT_FOUND, message: "User Not Found" }
        }
        return user.subscriptionPlan || 'FREE';
    }
}