import mongoose from "mongoose";

const nftSchema = mongoose.Schema({
    mintKey: {
        type: String,
        required: true,
        unique: true,
        // validate: [isBase58, "invalid mintkey"]
    },

    owner: {
        type: String,
        required: true,
    },

    buyerWallet: String,

    inSale: {
        type: Boolean,
        default: false
    },

    priceAmount: {
        type: Number,
        required: false,
    },

    collectionName:{
        type: String,
        required: true,
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    listedAt: {
        type: Date,
        required: true,
        default: new Date()
    },
    
   

})
export const NFTS = mongoose.model("nfts", nftSchema)
