import mongoose, { Schema } from "mongoose";

export interface IUrl extends Document {
  shortId: string;
  originalUrl: string;
  userId: mongoose.Types.ObjectId;
  customAlias?: string;
  expiresAt?: Date;
  passwordHash: string;
  isActive: boolean;
  deviceUrls?: {
    ios?: string;
    android?: string;
  };
  totalClicks: number;
  activatesAt?: Date;
}


const urlSchema = new Schema<IUrl>({
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true
  },

  customAlias: {
    type: String,
    sparse: true, // allows multiple nulls but enforces uniqueness on non-null values
    unique: true,
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // MongoDB will auto-delete expired docs (TTL - (Time To Live) index)
  },
  passwordHash: {
    type: String,
    default: ""
  },

  isActive: {
    type: Boolean,
    default: true
  },

  deviceUrls: {
    ios: { type: String, default: null },
    android: { type: String, default: null }
  },

  totalClicks: {
    type: Number,
    default: 0
  },
  activatesAt: {
    type: Date,
  }
}, { timestamps: true });

export const Url = mongoose.model<IUrl>('urls', urlSchema);