import { config } from "../config.js";
import {users} from "../users.js";
import UserModel from "../models/UserModel.js";
import ConfigModel from "../models/ConfigModel.js";


export const setUsers = async () => {
    try {
        const usersData = await UserModel.find();

        users.users = [...usersData];

    } catch (err) {
        console.log(err)
    }
};

export const setConfig = async () => {
    try {
        const configData = await ConfigModel.findOne({id: 1});
        config.sendedData = configData.sendedData;
    } catch (err) {
        console.log(err);
    }
}