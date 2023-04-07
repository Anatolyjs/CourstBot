import mongoose from "mongoose";

const ConfigSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    adminId: {
        type: Number, 
        required: true
    },
    adminId2: Number,
    sendedData: {
        type: Number,
        required: true
    },
    channelToCheck: {
        type: String,
        required: true
    },
});

export default mongoose.model('Config', ConfigSchema);