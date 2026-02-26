import express from "express";
import { MiddleWares } from "../../middlewares/middleware.js";
import { AnalyticsController } from "./analytics.controller.js";

export class AnalyticsRouter {
    public router: express.Router;

    constructor(
        private readonly middlewares: MiddleWares,
        private readonly analyticsController: AnalyticsController
    ) {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        const basePath = '/:shortId';
        this.router.get(`${basePath}/summary`, (req, res, next) => this.middlewares.allowloginuser(req, res, next), (req, res, next)=> this.middlewares.allowPremiumUser(req, res, next), (req, res) => this.analyticsController.getSummary(req, res));
        this.router.get(`${basePath}/timeseries`, (req, res, next) => this.middlewares.allowloginuser(req, res, next),(req, res, next)=> this.middlewares.allowPremiumUser(req, res, next), (req, res) => this.analyticsController.getTimeseries(req, res));
        this.router.get(`${basePath}/devices`, (req, res, next) => this.middlewares.allowloginuser(req, res, next),(req, res, next)=> this.middlewares.allowPremiumUser(req, res, next), (req, res) => this.analyticsController.getDevices(req, res));
        this.router.get(`${basePath}/utmData`, (req, res, next) => this.middlewares.allowloginuser(req, res, next),(req, res, next)=> this.middlewares.allowPremiumUser(req, res, next), (req, res) => this.analyticsController.getUTMData(req, res));
        this.router.get(`${basePath}/locations`, (req, res, next) => this.middlewares.allowloginuser(req, res, next),(req, res, next)=> this.middlewares.allowPremiumUser(req, res, next), (req, res) => this.analyticsController.getLocations(req, res));
        this.router.get(`${basePath}/referrers`, (req, res, next) => this.middlewares.allowloginuser(req, res, next),(req, res, next)=> this.middlewares.allowPremiumUser(req, res, next), (req, res) => this.analyticsController.getReferrers(req, res));
    }

}