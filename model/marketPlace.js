import mongoose from "mongoose";

const marketPlaceSchema = mongoose.Schema({
    id: {
        type: Number,
        default: 1,
    },
    trades: {
        type: Number,
        default: 0,
        required: true
    },
    timestemp: {
        type: Date,
        default: Date.now()
    },
    lifeTime:{
        type: Date,
        default: Date.now() +  24 * 60 * 60 * 1000,
    }
})

export const MarketPlex = mongoose.model("marketPlace", marketPlaceSchema)