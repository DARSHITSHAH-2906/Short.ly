import mongoose, {Schema} from "mongoose";

export interface ICounter extends Document{
    seq : string,
    counter : number
}

const CounterSchema = new Schema<ICounter>({
    seq : {
        type : String,
        default : "urlId",
    },
    counter : {
        type : Number,
        default : 10000
    }
})

export const Counter = mongoose.model<ICounter>('counters', CounterSchema);