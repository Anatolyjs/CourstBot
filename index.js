import { Telegraf } from 'telegraf';
import mongoose from "mongoose";
import dotenv from 'dotenv';

import * as commandsFun from './commands/commands.js';
import * as dataFunctions from './sendDataFunctions/sendDataFunctions.js';
import { setConfig, setUsers } from './setDataFromBD/setDataFromBD.js';

import { createConfig } from './controllers/ConfigController.js';

dotenv.config();

const options = {
    useNewUrlParser: true,
    autoIndex: true, 
    maxPoolSize:2000,
    minPoolSize: 10,
    retryWrites: true,
    bufferCommands: 1
  };

mongoose
    .connect(`mongodb+srv://${process.env.BD_TOKEN}.mongodb.net/Course?`, options)
    .then(async () =>  {
        console.log('DB okey');
        await setConfig();
        setUsers().then(() => {
            console.log('users setted');
            // dataFunctions.sendInfoForUsers();
        }).catch((err) => {
            console.log(err)
        })
        await createConfig();
    })
    .catch((err) => console.log('DB error', err))


const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(commandsFun.start);
bot.help(commandsFun.help);

bot.command('register', commandsFun.register);

bot.command('getUsers', commandsFun.getUsersCount);


bot.launch();

dataFunctions.sendMaterial();

// const restartAllUsers = async () => {
//     for( let i = 0; i < users.users.length; i++) {
//         const userId = users.users[i].id;
//         console.log('updateing user', userId);
//         await 
//     }
// }
// await UserModel.updateMany({}, {$set: {tests: testsToBd}});
// setTimeout(restartAllUsers, 5000);

// await UserModel.updateMany({}, {$set: {receivedData: 1, completedTest: 1, score: 0, tests: newTests}});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));