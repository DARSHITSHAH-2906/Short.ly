import mongoose, { Document } from 'mongoose';

export interface IClickAnalytics extends Document {
    shortId: string;
    urlId: mongoose.Types.ObjectId;
    timestamp?: Date;
    referrer?: string;
    browser?: string;
    os?: string;
    deviceType?: string;
    country?: string;
    city?: string;
    isBot?: boolean;
    // --- High Impact Metrics ---
    isUnique?: boolean;
    visitorId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
}

const clickAnalyticsSchema = new mongoose.Schema({
    shortId: { type: String, required: true, index: true },
    urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'urls', required: true },
    timestamp: { type: Date, default: Date.now },
    
    referrer: { type: String, default: 'Direct' },
    browser: { type: String },
    os: { type: String },
    deviceType: { type: String },
    country: { type: String },
    city: { type: String },
    isBot: { type: Boolean, default: false },
    
    isUnique: { type: Boolean, default: false },
    visitorId: { type: String },
    
    utmSource: { type: String, default: null },
    utmMedium: { type: String, default: null },
    utmCampaign: { type: String, default: null },
    utmTerm: { type: String, default: null },
    utmContent: { type: String, default: null }
});

// Crucial Compound Index: This makes fetching dashboard data for a specific link lightning fast
clickAnalyticsSchema.index({ shortId: 1, timestamp: -1 });

export const ClickAnalytics = mongoose.model<IClickAnalytics>('ClickAnalytics', clickAnalyticsSchema);