import express from 'express';
import { AnalyticsService } from './analytics.service.js';
import { HttpCodes } from '../../utils/httpCodes.js';

export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    private async handleAnalyticsRequest(
        req: express.Request,
        res: express.Response,
        serviceMethod: Function
    ) {
        try {
            const { shortId } = req.params;
            const {utmParam} = req.query;
            const user = req.user as any;
            const userId = user.sub;
            const days = req.query.days as string;

            const data = await serviceMethod.call(this.analyticsService, shortId, userId, parseInt(days));
            return res.status(HttpCodes.SUCCESS).json({ status: "success", data });

        } catch (error: any) {
            if (error.code === HttpCodes.URL_NOT_FOUND) {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: error.message });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch analytics" });
        }
    };

    async getSummary(req: express.Request, res: express.Response) {
        try {
            const { shortId } = req.params;
            const user = req.user as any;
            const userId = user.sub;
            const days = req.query.days as string;

            const data = await this.analyticsService.getSummary(shortId, userId, parseInt(days));
            return res.status(HttpCodes.SUCCESS).json({ status: "success", data });

        } catch (error: any) {
            if (error.code === HttpCodes.URL_NOT_FOUND) {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: error.message });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch analytics" });
        }
    }

    async getTimeseries(req: express.Request, res: express.Response) {
        try {
            const { shortId } = req.params;
            const user = req.user as any;
            const userId = user.sub;
            const days = req.query.days as string;

            const data = await this.analyticsService.getTimeseries(shortId, userId, parseInt(days));
            return res.status(HttpCodes.SUCCESS).json({ status: "success", data });

        } catch (error: any) {
            if (error.code === HttpCodes.URL_NOT_FOUND) {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: error.message });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch analytics" });
        }
    }

    async getDevices(req: express.Request, res: express.Response) {
        try {
            const { shortId } = req.params;
            const user = req.user as any;
            const userId = user.sub;
            const days = req.query.days as string;

            const data = await this.analyticsService.getDevices(shortId, userId, parseInt(days));
            return res.status(HttpCodes.SUCCESS).json({ status: "success", data });

        } catch (error: any) {
            if (error.code === HttpCodes.URL_NOT_FOUND) {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: error.message });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch analytics" });
        }
    }

    async getUTMData(req: express.Request, res: express.Response) {
        try {
            const { shortId } = req.params;
            const utmField = req.query.utmParam as string;
            const days = req.query.days as string;
            const user = req.user as any;
            const userId = user.sub;

            if (!utmField || !['utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent'].includes(utmField.toString())) {
                return res.status(HttpCodes.BAD_REQUEST).json({ status: "error", message: "Invalid UTM field" });
            }

            const data = await this.analyticsService.getUTMData(shortId, userId, parseInt(days), utmField);
            return res.status(HttpCodes.SUCCESS).json({ status: "success", data });

        } catch (error: any) {
            if (error.code === HttpCodes.URL_NOT_FOUND) {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: error.message });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch analytics" });
        }
    }

    async getLocations (req: express.Request, res: express.Response){
        try {
            const { shortId } = req.params;
            const user = req.user as any;
            const userId = user.sub;
            const days = req.query.days as string;

            const data = await this.analyticsService.getLocations(shortId, userId, parseInt(days));
            return res.status(HttpCodes.SUCCESS).json({ status: "success", data });

        } catch (error: any) {
            if (error.code === HttpCodes.URL_NOT_FOUND) {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: error.message });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch analytics" });
        }
    }

    async getReferrers(req: express.Request, res: express.Response) {
        try {
            const { shortId } = req.params;
            const user = req.user as any;
            const userId = user.sub;
            const days = req.query.days as string;

            const data = await this.analyticsService.getReferrers(shortId, userId, parseInt(days));
            return res.status(HttpCodes.SUCCESS).json({ status: "success", data });

        } catch (error: any) {
            if (error.code === HttpCodes.URL_NOT_FOUND) {
                return res.status(HttpCodes.URL_NOT_FOUND).json({ status: "error", message: error.message });
            }
            return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to fetch analytics" });
        }
    }
}