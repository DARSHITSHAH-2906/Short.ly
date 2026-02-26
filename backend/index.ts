import express from 'express';
import path from 'path';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import { ConnecttoDB } from './connect.js';
import { AuthRouter } from './auth/auth.router.js';
import { UrlRouter } from './url/url.routes.js';
import { UserRouter } from './users/users.routes.js';
import { AnalyticsRouter } from './url/analytics/analytics.routes.js';

import { MiddleWares } from './middlewares/middleware.js';

import { AuthService } from './auth/auth.service.js';
import { AuthController } from './auth/auth.controller.js';

import { TokenService } from './token/token.service.js';
import { TokenController } from './token/token.controller.js';

import { UserService } from './users/users.service.js';
import { UrlService } from './url/url.service.js';

import { UrlController } from './url/url.controller.js';
import { UserController } from './users/user.controller.js';

import { AnalyticsController } from './url/analytics/analytics.controller.js';
import { AnalyticsService } from './url/analytics/analytics.service.js';

config()

class App {
    app: express.Application;

    authRouter: express.Router;
    urlRouter: express.Router;
    userRouter: express.Router;
    analyticsRouter: express.Router;

    middlwares: MiddleWares;

    tokenService: TokenService;
    tokenController: TokenController;

    userService: UserService;
    userController: UserController

    urlService: UrlService;
    urlController: UrlController;

    authService: AuthService;
    authController: AuthController;

    analyticsService: AnalyticsService;
    analyticsController: AnalyticsController;
    constructor() {
        this.app = express()

        this.tokenService = new TokenService();
        this.tokenController = new TokenController(this.tokenService);
        this.middlwares = new MiddleWares(this.tokenController);

        this.urlService = new UrlService();

        this.userService = new UserService(this.urlService);
        this.userController = new UserController(this.userService);

        this.authService = new AuthService(this.userService, this.tokenService);
        this.authController = new AuthController(this.tokenController, this.authService);

        this.analyticsService = new AnalyticsService(this.urlService);
        this.analyticsController = new AnalyticsController(this.analyticsService);

        this.urlController = new UrlController(this.urlService, this.analyticsService, this.userService);

        this.userRouter = new UserRouter(this.middlwares, this.userController).router
        this.authRouter = new AuthRouter(this.authService, this.authController, this.middlwares).router;
        this.urlRouter = new UrlRouter(this.middlwares, this.urlController).router
        this.analyticsRouter = new AnalyticsRouter(this.middlwares, this.analyticsController).router
    }

    async bootstrap() {
        await ConnecttoDB();
        this.app.use(cors({
            origin: "http://localhost:3000",
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: false }))
        this.app.use(cookieparser())
        this.app.use(express.static(path.resolve('./public')))

        //routes
        this.app.use('/auth', this.authRouter);
        this.app.use('/url', this.urlRouter);
        this.app.use('/user', this.userRouter);
        this.app.use('/url/analytics', this.analyticsRouter);

        this.app.listen(process.env.PORT || 8000, () => console.log(`Server started at ${process.env.PORT || 8000}`))
    }
}

const app = new App();
app.bootstrap()

