import ConfigModel from "../models/ConfigModel.js";

export const createConfig = async () => {
    try {
        const configData = await ConfigModel.findOne({ id: 1 });

        if (configData) {
            return;
        }
        const doc = new ConfigModel({
            id: 1,
            adminId: 1024867095,
            sendedData: 0,
            channelToCheck: '@trade_soul',
        });

        await doc.save();

    } catch (err) {
        console.log(err);
    }
}