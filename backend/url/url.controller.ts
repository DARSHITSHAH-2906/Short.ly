import express, { Request, Response } from "express";
import { UrlService } from "./url.service.js";
import { AnalyticsService } from "./analytics/analytics.service.js";
import { HttpCodes } from "../utils/httpCodes.js";
import { UserService } from "../users/users.service.js";

export class UrlController {
    constructor(private readonly urlService: UrlService, private readonly analyticsService: AnalyticsService, private readonly userService: UserService) { }

    async generateShortUrl(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const userId = user.sub;
            const userPlan = user.subscriptionPlan || 'FREE';

            if (userPlan === "FREE" || userPlan === "PRO") {
                const availableCredits = await this.userService.getAvailableCredits(userId);
                if (availableCredits <= 0) {
                    return res.status(HttpCodes.NOT_ENOUGH_CREDITS).json({ status: "error", message: "You have no credits left." });
                }
            }

            const { originalUrl, customAlias, expiresAt, password, deviceUrls, activatesAt } = req.body;

            const isPremiumUser = ['PRO', 'ENTERPRISE'].includes(userPlan);

            const requestedPremiumFeatures = customAlias || expiresAt || password || deviceUrls?.ios || deviceUrls?.android || activatesAt;

            if (requestedPremiumFeatures && !isPremiumUser) {
                return res.status(403).json({ status: "error", message: "Premium plan required for these features." });
            }

            if (!requestedPremiumFeatures) {
                const existingShortId = await this.urlService.findUrl(originalUrl, userId);
                if (existingShortId) {
                    return res.status(HttpCodes.URL_CREATED).json({
                        status: "success",
                        message: "You already have a short URL for this destination.",
                        shortUrl: `${process.env.BASE_URL}/${existingShortId}`
                    });
                }
            }

            await this.urlService.generateShortUrl({ originalUrl, userId, customAlias, expiresAt, password, deviceUrls, activatesAt });

            if (userPlan === "FREE" || userPlan === "PRO") {
                await this.userService.decreaseCredits(userId);
            }

            return res.status(HttpCodes.URL_CREATED).json({
                status: "success",
                message: "Short URL generated"
            });

        } catch (error: any) {
            if (error.message === 'Custom alias already in use') {
                return res.status(HttpCodes.CUSTOM_ALIAS_ALREADY_IN_USE).json({ status: "error", message: error.message });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to generate URL" });
        }
    }

    async updateShortUrl(req: Request, res: Response) {
        try {
            const { shortId } = req.params;
            const user = req.user as any;
            const userId = user.sub;
            const userPlan = user.subscriptionPlan || 'FREE';
            const updatePayload: Record<string,string> = {}
            const {originalUrl, customAlias } = req.body;
            if(originalUrl) updatePayload['originalUrl'] = originalUrl;
            if(customAlias) updatePayload['customAlias'] = customAlias;

            const {expiresAt, password, isActive, deviceUrls,activatesAt } = req.body;
            const hasPremiumFeatures = expiresAt || password || deviceUrls?.ios || deviceUrls?.android || activatesAt;

            const isPremiumUser = ['PRO', 'ENTERPRISE'].includes(userPlan);
            if (isPremiumUser && hasPremiumFeatures) {
                if (expiresAt) updatePayload['expiresAt'] = expiresAt;
                if (password) updatePayload['password'] = password;
                if (deviceUrls) updatePayload['deviceUrls'] = deviceUrls;
                if (activatesAt) updatePayload['activatesAt'] = activatesAt;
                if (isActive !== undefined) updatePayload['isActive'] = isActive;
            }

            await this.urlService.updateShortUrl(shortId, userId, updatePayload);

            return res.status(HttpCodes.URL_UPDATED).json({
                status: "success",
                message: "URL updated successfully",
            });

        } catch (error: any) {
            if (error.message === "URL not found or unauthorized") {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: error.message });
            }
            if (error.message === 'Custom alias already in use') {
                return res.status(HttpCodes.CUSTOM_ALIAS_ALREADY_IN_USE).json({ status: "error", message: error.message });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to update URL" });
        }
    }

    deleteShortUrl = async (req: Request, res: Response) => {
        try {
            const { shortId } = req.params;
            const user = req.user as any;
            const userId = user.sub;

            await this.urlService.deleteUrl(shortId, userId);

            return res.status(HttpCodes.URL_DELETED).json({ status: "success", message: "Short URL deleted" });
        } catch (error: any) {
            if (error.code === HttpCodes.URL_NOT_FOUND) {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: error.message });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to delete URL" });
        }
    }

    async redirectUser(req: Request, res: Response) {
        try {
            const { shortId } = req.params;
            const urlDoc = await this.urlService.getUrlForRedirect(shortId);
            if (!urlDoc) {
                return res.status(HttpCodes.URL_NOT_FOUND).send('URL not found or has been temporarily paused.');
            }
            if (urlDoc.isActive === false) {
                return res.status(HttpCodes.URL_INACTIVE).send('This URL is currently paused. Please try again later.');
            }
            const destinationUrl = new URL(urlDoc.originalUrl);
            await this.urlService.incrementClickCount(shortId);

            const ownerSusbcriptionPlan = await this.userService.getSubscriptionPlan(urlDoc.userId);

            if(ownerSusbcriptionPlan !== 'FREE') {
                for (const [key, value] of Object.entries(req.query)) {
                    if (typeof value === 'string') {
                        destinationUrl.searchParams.set(key, value);
                    }
                }
            }
            let analyticsPayload;
            if(ownerSusbcriptionPlan !== 'FREE'){
                analyticsPayload = this.analyticsService.extractClickData(req, res, urlDoc.shortId, destinationUrl);
            }

            res.redirect(HttpCodes.REDIRECT, destinationUrl.toString());

            // analyticsQueue.add('process-click', analyticsPayload);
            this.analyticsService.saveClickData(analyticsPayload)
                .catch(err => {
                    console.error("Failed to save background analytics:", err);
                })

        } catch (error) {
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
        }
    }

    async fetchUrlDetails(req: Request, res: Response) {
        try {
            const { shortId } = req.params;
            const user = req.user as any;
            const userId = user.sub;
            const urlDoc = await this.urlService.fetchUrlDetails(shortId, userId);
            if (!urlDoc) {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: "URL not found" });
            }
            return res.status(HttpCodes.SUCCESS).json({ status: "success", data: urlDoc });
        } catch (error) {
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal Server Error" });
        }
    }

    async validateShortId(req: Request, res: Response) {
        try {
            const { shortId } = req.params;
            const urlDoc = await this.urlService.getUrlForRedirect(shortId);
            if (!urlDoc) {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: "Short URL not found" });
            }
            if (urlDoc.isActive === false) {
                return res.status(HttpCodes.URL_INACTIVE).json({ status: "error", message: "This URL is currently paused. Please try again later." });
            }
            return res.status(HttpCodes.SUCCESS).json({ status: "success", message: "Short URL is valid" });
        } catch (error) {
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Internal Server Error" });
        }

    }
}