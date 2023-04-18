import { Telegraf } from 'telegraf';
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

import * as commandsFun from './commands/commands.js';
import * as dataFunctions from './sendDataFunctions/sendDataFunctions.js';
import tests from './tests/tests.js';
import { users } from './users.js';
import { setConfig, setUsers } from './setDataFromBD/setDataFromBD.js';
import UserModel from './models/UserModel.js';
import { createConfig } from './controllers/ConfigController.js';


dotenv.config();
const addActions = () => {
    tests.forEach((test) => {
        test.questions.forEach((question, index) => {
            question.answers.forEach((answer) => {
                bot.action(answer.value, async (ctx) => {
                    try {
                        const userId = ctx.update.callback_query.from.id;
                        // const usersArr = await UserModel.find();
                        
                        let user = users.users.find((user) => user.id === userId);
                        if (user.completedTest === (+answer.value[1] + 1)) {
                            return;
                        }//

                        const isExist = user.tests[user.completedTest].answers.find((answerValue) => {
                            if (answer.value.match(/\d+$/).toString() === answerValue.match(/\d+$/).toString()) {
                                return 1
                            } else {
                                return 0;
                            }
                        });
                        
                        // return arrayAnswers.find((val) => val.match(/\d+$/).toString() == currentAnsw.match(/\d+$/).toString());
                        if (isExist) {
                            return
                        }

                        await ctx.replyWithHTML(`<b>Вы выбрали ${answer.text}</b>`);
                        user.tests[user.completedTest].answers.push(answer.value);
                        if (answer.value === tests[user.completedTest].questions[user.qurrentQuestionIndex].rightAnswer) {
                            user.score++;
                            user.tests[user.completedTest].rightAnswers.push(user.qurrentQuestionIndex + 1);
                        } else {
                            user.tests[user.completedTest].wrongAnswers.push(user.qurrentQuestionIndex + 1);
                        }

                        user.qurrentQuestionIndex++;
                        dataFunctions.sendQuestion(user);
           
                    } catch (err) {
                        console.log(err)
                    }
                })
            })
        })
    })
}

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
            addActions();
            console.log('users setted');
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
bot.command('test', commandsFun.test);
bot.command('rating', commandsFun.rating);
bot.command('getUsers', commandsFun.getUsersCount);
bot.command('deleteAll', commandsFun.deleteAll);

bot.launch();

dataFunctions.sendMaterial();


const newTests = [
    {
        id: 1,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 2,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 3,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 4,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 5,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 6,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 7,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 8,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 9,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 10,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 11,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    },
    {
        id: 12,
        rightAnswers: [],
        wrongAnswers: [],
        answers: []
    }
]

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