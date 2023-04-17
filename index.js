import { Telegraf } from 'telegraf';
import mongoose from "mongoose";
import dotenv from 'dotenv';

import * as commandsFun from './commands/commands.js';
import * as dataFunctions from './sendDataFunctions/sendDataFunctions.js';
import tests from './tests/tests.js';
import { users } from './users.js';
import { setConfig, setUsers } from './setDataFromBD/setDataFromBD.js';
import UserModel from './models/UserModel.js';
import { createConfig } from './controllers/ConfigController.js';

dotenv.config();

mongoose
    .connect(`mongodb+srv://${process.env.BD_TOKEN}.mongodb.net/Course?retryWrites=true&w=majority`)
    .then(() => console.log('DB okey'))
    .catch((err) => console.log('DB error', err))


const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(commandsFun.start);
bot.help(commandsFun.help);

bot.command('register', commandsFun.register);
bot.command('test', commandsFun.test);
bot.command('rating', commandsFun.rating);
bot.command('getUsers', commandsFun.getUsersCount);
bot.command('deleteAll', commandsFun.deleteAll);

let errorsCount = 0;
bot.launch();

dataFunctions.sendMaterial();

const addActions = () => {
    tests.forEach((test) => {
        test.questions.forEach((question, index) => {
            question.answers.forEach((answer) => {
                bot.action(answer.value, async (ctx) => {
                    try {
                        await ctx.reply(`Вы выбрали ${answer.text}`);

                        const userId = ctx.update.callback_query.from.id;
                        let user = users.users.find((user) => user.id === userId);
                        if (answer.value === tests[user.completedTest].questions[user.qurrentQuestionIndex].rightAnswer) {
                            user.score++;
                            user.tests[user.completedTest].rightAnswers.push(user.qurrentQuestionIndex + 1);
                            
                            user = await UserModel.findOneAndUpdate(
                                {
                                    id: userId
                                },
                                {
                                    $set: {tests: user.tests},
                                    $inc: { score: 1 }
                                },
                                {
                                    returnDocument: 'after'
                                })

                        } else {
                            user.tests[user.completedTest].wrongAnswers.push(user.qurrentQuestionIndex + 1);
                        }

                        try {
                            await bot.telegram.deleteMessage(user.messageToDelete.chatId, user.messageToDelete.messageId);
                        } catch (err) {
                            console.log('не получилось удалить сообщение')
                        }

                        user = await UserModel.findOneAndUpdate(
                            {
                                id: userId
                            },
                            {
                                $set: { tests: user.tests, messageToDelete: { chatId: null, messageId: null } },
                                $inc: { qurrentQuestionIndex: 1 },
                            },
                            {
                                returnDocument: 'after'
                            });

                        dataFunctions.sendQuestion(user);
                        setUsers();
                    } catch (err) {
                        console.log(err)
                    }
                })
            })
        })
    })
}


addActions();

await createConfig();
await setUsers();
await setConfig();


// const restartAllUsers = async () => {
//     console.log()
//     for( let i = 0; i < users.users.length; i++) {
//         const userId = users.users[i].id;
//         console.log('updateing user', userId);
//         await UserModel.findOneAndUpdate({id: userId}, {$set: {receivedData: 0, qurrentQuestionIndex: 0, score: 0, completedTest: 0}});
//     }
// }
// setTimeout(restartAllUsers, 5000);
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));