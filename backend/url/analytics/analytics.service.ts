import mongoose from 'mongoose';
import {Request, Response} from 'express';
import { ClickAnalytics } from './models/analytics.js';
import { Url } from '../models/url.js';
import { UrlService } from '../url.service.js';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import { HttpCodes } from '../../utils/httpCodes.js';

export interface ClickDataPayload {
    shortId: string;
    timestamp: Date;
    ipAddress: string;
    referrer: string;
    browser: string;
    os: string;
    deviceType: string;
    country: string;
    city: string;
    isBot: boolean;
    isUnique: boolean;
    visitorId: string;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
}

export class AnalyticsService {
    mockIpAddresses = [{ipAddress: '8.8.8.8', location: 'US Mountain View'}, {ipAddress: '49.36.15.255', location: 'IN Mumbai'}, {ipAddress: '146.196.44.17', location: 'UK London'}];
    constructor( private readonly urlService: UrlService) {}

    private async buildMatchStage(shortId: string, userId: string, days: number) {
        const urlDoc = await Url.findOne({ shortId, userId: new mongoose.Types.ObjectId(userId) });
        if (!urlDoc) throw {code : HttpCodes.URL_NOT_FOUND, message: "URL not found" };

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        return {
            shortId,
            timestamp: { $gte: dateLimit },
            isBot: false
        };
    }

    // 1. Get Summary (Fastest)
    async getSummary(shortId: string, userId: string, days: number) {
        const match = await this.buildMatchStage(shortId, userId, days);
        const result = await ClickAnalytics.aggregate([
            { $match: match },
            { $group: { 
                    _id: null,
                    totalClicks: { $sum : 1 },
                    uniqueVisitors: { $sum: { $cond: [{ $eq: ["$isUnique", true] }, 1, 0] } }
            }}
        ]);
        return result[0] || { totalClicks: 0, uniqueVisitors: 0 };
    }

    // 2. Get Time-Series (For Line Chart)
    async getTimeseries(shortId: string, userId: string, days: number) {
        const match = await this.buildMatchStage(shortId, userId, days);
        return await ClickAnalytics.aggregate([
            { $match: match },
            { $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    clicks: { $sum: 1 },
                    unique: { $sum: { $cond: [{ $eq: ["$isUnique", true] }, 1, 0] } }
            }},
            { $sort: { "_id": 1 } }
        ]).then(data => data.map(item => ({ date: item._id, clicks: item.clicks, unique: item.unique })));
    }

    // 3. Get Devices & OS (For Donut Chart)
    async getDevices(shortId: string, userId: string, days: number) {
        const match = await this.buildMatchStage(shortId, userId, days);
        return await ClickAnalytics.aggregate([
            { $match: match },
            { $group: { _id: "$deviceType", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).then(data => data.map(item => ({ name: item._id, value: item.count })));
    }

    // 4. Get UTM Data (For Data Table)
    async getUTMData(shortId: string, userId: string, days: number, utmField : string) {
        const match = await this.buildMatchStage(shortId, userId, days);
        return await ClickAnalytics.aggregate([
            { $match: { ...match, [utmField]: { $ne: undefined } } },
            { $group: { _id: `$${utmField}`, clicks: { $sum: 1 } } },
            { $sort: { clicks: -1 } },
        ]).then(data => data.map(item => ({ name: item._id, clicks: item.clicks })));
    }

    async getLocations(shortId: string, userId: string, days: number) {
        const match = await this.buildMatchStage(shortId, userId, days);
        return await ClickAnalytics.aggregate([
            { $match: { ...match, country: { $ne: 'Unknown' } } },
            { $group: { _id: { country: "$country", city: "$city" }, clicks: { $sum: 1 } } },
            { $sort: { clicks: -1 } },
        ]).then(data => data.map(item => ({ country: item._id.country, city: item._id.city, clicks: item.clicks })));
    }

    async getReferrers(shortId: string, userId: string, days: number) {
        const match = await this.buildMatchStage(shortId, userId, days);
        const referrerData = await ClickAnalytics.aggregate([
            {$match : match},
            {$group : { _id : "$referrer", clicks : { $sum : 1 } }},
            {$sort : { clicks : -1 }},
        ])
        .then(data => data.map(item => ({ referrer: item._id, clicks: item.clicks })));
        return referrerData;
    }

    extractClickData(req: Request, res: Response, shortId: string, destinationUrl: URL) {
        const timestamp = new Date();
        const referrer = req.headers.referer || req.headers.referrer || 'Direct';

        const userAgentString = req.headers['user-agent'] || '';
        const parser = new UAParser(userAgentString);
        const browser = parser.getBrowser();
        const os = parser.getOS();
        const device = parser.getDevice();
        const isBot = /bot|crawler|spider|crawling/i.test(userAgentString);

        const forwardedIps = req.headers['x-forwarded-for'];
        let ipAddress = typeof forwardedIps === 'string'
            ? forwardedIps.split(',')[0].trim()
            : req.socket.remoteAddress || 'Unknown';

        let country = 'Unknown';
        let city = 'Unknown';

        if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
            const randomIndex = Math.floor(Math.random() * this.mockIpAddresses.length);
            ipAddress = this.mockIpAddresses[randomIndex].ipAddress
        }
        const geo = geoip.lookup(ipAddress);
        if (geo) {
            country = geo.country;
            city = geo.city;
        }

        let visitorId = req.cookies?._visitor_id;
        let isUnique = false;

        if (!visitorId || visitorId !== shortId) {
            isUnique = true;
            visitorId = shortId;
            res.cookie('_visitor_id', visitorId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 365 * 24 * 60 * 60 * 1000
            });
        }

        const utmSource = destinationUrl.searchParams.get('utm_source');
        const utmMedium = destinationUrl.searchParams.get('utm_medium');
        const utmCampaign = destinationUrl.searchParams.get('utm_campaign');
        const utmTerm = destinationUrl.searchParams.get('utm_term');
        const utmContent = destinationUrl.searchParams.get('utm_content');

        return {
            shortId,
            timestamp,
            ipAddress,
            referrer,
            browser: browser.name || 'Unknown',
            os: os.name || 'Unknown',
            deviceType: device.type || 'desktop', // Default to desktop if ua-parser returns undefined
            country,
            city,
            isBot,
            isUnique,
            visitorId,
            utmSource,
            utmMedium,
            utmCampaign,
            utmTerm,
            utmContent
        };
    }

    async saveClickData(payload: any): Promise<void> {
        try {
            const urlDoc = await Url.findOne({ shortId: payload.shortId });
            if (!urlDoc) return;

            const newClick = new ClickAnalytics({
                ...payload,
                urlId: urlDoc._id
            });
            await newClick.save();

            await Url.findByIdAndUpdate(urlDoc._id, { $inc: { totalClicks: 1 } });

        } catch (error) {
            throw error;
        }
    }
}