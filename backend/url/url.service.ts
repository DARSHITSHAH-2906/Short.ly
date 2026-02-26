import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Base62Encode } from "../utils/base62.encoding.js";
import { Counter } from "./models/counter.js";
import { Url } from "./models/url.js";
import { HttpCodes } from "../utils/httpCodes.js";

export interface CreateUrlPayload {
    originalUrl: string;
    userId: string;
    customAlias?: string;
    expiresAt?: Date;
    password?: string;
    deviceUrls?: { ios?: string; android?: string; };
    activatesAt?: Date;
}

export interface UpdateUrlPayload extends Partial<CreateUrlPayload> {
    isActive?: boolean;
}

interface Urls {
    _id: mongoose.Types.ObjectId,
    originalUrl: string,
    shortId: string,
    totalClicks: number,
    isActive: boolean,
    customAlias? : string | null
}

export class UrlService {
    constructor() { }

    async findNextId(seq: string): Promise<number> {
        const counter = await Counter.findOneAndUpdate(
            { seq }, 
            { $inc: { counter: 1 } }, 
            { new: true, upsert: true }
        );
        return counter ? counter.counter : 10000;
    }

    async findUrl(originalUrl: string, userId: string): Promise<string | null> {
        const url = await Url.findOne({ originalUrl, userId: new mongoose.Types.ObjectId(userId) });
        return url ? url.shortId : null;
    }

    async generateShortUrl(data: CreateUrlPayload) {
        const id = await this.findNextId("urlId");
        const shortId = Base62Encode(id);

        if (data.customAlias) {
            const aliasTaken = await Url.findOne({ customAlias : data.customAlias });
            if (aliasTaken) throw {code : HttpCodes.CUSTOM_ALIAS_ALREADY_IN_USE, message: "Custom alias already in use"};
        } else {
        }

        let hashedPassword;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 10);
        }

        const newUrl = new Url({
            ...data, shortId , userId : new mongoose.Types.ObjectId(data.userId), passwordHash : hashedPassword
        });

        try {
            await newUrl.save();
            return;
        } catch (error: any) {
            if (error.code === 11000 && error.keyPattern?.customAlias) {
                throw new Error('Custom alias already in use');
            }
            throw new Error("Failed to save URL to the database");
        }
    }

    async updateShortUrl(shortId: string, userId: string, updateData: UpdateUrlPayload) {
        const existingUrl = await Url.findOne({ 
            shortId: shortId, 
            userId: new mongoose.Types.ObjectId(userId) 
        });

        if (!existingUrl) {
            throw {code : HttpCodes.URL_NOT_FOUND, message: "URL not found"};
        }

        if (updateData.password) {
            existingUrl.passwordHash = await bcrypt.hash(updateData.password, 10);
        } else if (updateData.password === "") {
            existingUrl.passwordHash = ""; 
        }

        if (updateData.customAlias && updateData.customAlias !== existingUrl.customAlias) {
            const aliasTaken = await Url.findOne({$or : [ { shortId: updateData.customAlias }, { customAlias: updateData.customAlias } ]});
            if (aliasTaken) throw {code : HttpCodes.CUSTOM_ALIAS_ALREADY_IN_USE, message: "Custom alias already in use"};
            existingUrl.customAlias = updateData.customAlias;
        }

        if (updateData.expiresAt !== undefined) existingUrl.expiresAt = updateData.expiresAt;
        if (updateData.isActive !== undefined) existingUrl.isActive = updateData.isActive;
        if (updateData.deviceUrls !== undefined) existingUrl.deviceUrls = updateData.deviceUrls;

        await existingUrl.save();
        return;
    }

    async deleteUrl(shortId: string, userId: string): Promise<void> {
        const deletedUrl = await Url.findOneAndDelete({
            shortId: shortId,
            userId: new mongoose.Types.ObjectId(userId)
        });
        if (!deletedUrl) throw {code : HttpCodes.URL_NOT_FOUND, message: "URL not found or unauthorized"};
    }

    async fetchUrls(userId: mongoose.Types.ObjectId): Promise<Urls[] | []>{
        const urls = await Url.find({userId: userId}).select("originalUrl customAlias shortId totalClicks isActive")
        return urls;
    }

    async getUrlForRedirect(shortId: string) {
        return await Url.findOne({$or : [{shortId : shortId} , {customAlias : shortId}]});
    }

    async fetchUrlDetails(shortId: string, userId: string) {
        return await Url.findOne({ shortId, userId: new mongoose.Types.ObjectId(userId) });
    }

    async incrementClickCount(shortId: string): Promise<void> {
        try{
            await Url.findOneAndUpdate({ shortId }, { $inc: { totalClicks: 1 } });
        }catch(error: any){
            if(error.code === HttpCodes.URL_NOT_FOUND) {
                throw {code : HttpCodes.URL_NOT_FOUND, message: "URL not found"};
            }
            throw error;
        }

    }



}