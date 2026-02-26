import mongoose, { Document, Schema } from 'mongoose';

enum SubscriptionPlan {
    FREE = "FREE",
    PRO = "PRO",
    ENTERPRISE = "ENTERPRISE"
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    refreshToken?: string;
    expiresAt?: Date;
    subscriptionPlan : SubscriptionPlan,
    availableCredits : number
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email must be unique"]
    },
    password: {
        type: String,
        required: false,
    },
    refreshToken :{
        type : String,
        required : false
    },
    expiresAt :{
        type : Date,
        required : false,
        default : Date.now() + 7*24*60*60*1000
    },
    subscriptionPlan :{
        type : String,
        enum : SubscriptionPlan,
        default : SubscriptionPlan.FREE
    },
    availableCredits : {
        type : Number,
        default : 10
    }
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>('users', userSchema);