import express from "express";
import { MiddleWares } from "../middlewares/middleware.js";
import { UrlController } from "../url/url.controller.js";
import { createUrlSchema } from "./validation/generate.schema.js";
import { searchUrlSchema } from "./validation/search.schema.js";

export class UrlRouter {
    router: express.Router;
    constructor(private readonly middlewares: MiddleWares, private readonly urlController: UrlController) {
        this.router = express.Router()
        this.intitializeRoutes()
    }

    intitializeRoutes() {
        this.router.post('/generate', this.middlewares.ValidateData(createUrlSchema) , (req, res, next) => this.middlewares.allowloginuser(req, res, next), (req, res) => this.urlController.generateShortUrl(req, res))
        this.router.get('/details/:shortId', (req, res, next) => this.middlewares.allowloginuser(req, res, next), (req, res) => this.urlController.fetchUrlDetails(req, res))
        this.router.delete('/delete/:shortId', (req, res, next) => this.middlewares.allowloginuser(req, res, next), (req, res) => this.urlController.deleteShortUrl(req, res))
        this.router.patch('/update/:shortId', (req, res, next) => this.middlewares.allowloginuser(req, res, next), (req, res) => this.urlController.updateShortUrl(req, res))
        this.router.get('/redirect/:shortId', (req, res) => this.urlController.redirectUser(req, res))
        this.router.get('/:shortId', this.middlewares.ValidateData(searchUrlSchema) , (req, res) => this.urlController.validateShortId(req, res))
    }
}