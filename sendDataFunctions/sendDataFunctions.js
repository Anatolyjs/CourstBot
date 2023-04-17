import dotenv from 'dotenv';
import { Telegraf, Markup } from 'telegraf';

import lessons from '../lessons/index.js';
import tests from '../tests/tests.js';
import { users } from '../users.js';
import UserModel from '../models/UserModel.js';
import { setConfig, setUsers } from '../setDataFromBD/setDataFromBD.js'
import { config } from '../config.js';
import ConfigModel from '../models/ConfigModel.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const sendData = async (to, photo, info, preview, caption) => {
    if (photo) {
        try {
            await bot.telegram.sendPhoto(to, { source: photo }, {
                caption: caption,
                parse_mode: 'HTML'
            });
            return;
        } catch (err) {
            console.log(err);
            return
        }
    }
    if (info) {
        try {
            if (preview) {
                await bot.telegram.sendMessage(to, info, { parse_mode: 'HTML', disable_web_page_preview: preview });
            } else {
                await bot.telegram.sendMessage(to, info, { parse_mode: 'HTML'});
            }
        } catch (err) {
            console.log(err);
        }
    }
};

export const sendMaterial = async () => {
    try {
        const interval = async () => {
            lessons.lessons.forEach(async (lesson, index) => {
                if (lesson.info) {
                    lesson.info.forEach((lessonItem, indexItem) => {
                        let currentDate = new Date();
                        const fixedDate = new Date(lessonItem.time);

                        if (fixedDate - currentDate < 0) {
                            return;
                        }

                        console.log(1);
                        setTimeout(async () => {
                            for (let i = 0; i < users.users.length; i++) {
                                if (users.users[i].completedTest === users.users[i].receivedData) {
                                    console.log('sending data to', users.users[i].id)
                                    setTimeout(async () => {
                                        await sendData(users.users[i].id, lessonItem.image, lessonItem.text, lessonItem.preview, lessonItem.caption);
                                        if (indexItem === lesson.info.length - 1) {
                                            await UserModel.findOneAndUpdate({ id: users.users[i].id }, { $inc: { receivedData: 1 } }, { returnDocument: 'after' });
                                            setUsers();
                                        }
                                    }, 100 * i);
                                }
                            }
                            if (indexItem === 0) {
                                await ConfigModel.findOneAndUpdate({ id: 1 }, { $inc: { sendedData: 1 } });
                                setUsers();
                            }
                            setConfig();
                        }, fixedDate - currentDate);
                    })
                } else {
                    let currentDate = new Date();
                    const fixedDate = new Date(lesson.time);

                    if (fixedDate - currentDate < 0) {
                        return;
                    }

                    setTimeout(async () => {
                        for (let i = 0; i < users.users.length; i++) {
                            if (users.users[i].completedTest === users.users[i].receivedData) {
                                console.log('sending data to', users.users[i].id)
                                setTimeout(async () => {
                                    await sendData(users.users[i].id, lesson.image, lesson.text, lesson.preview, lesson.caption);
                                    await UserModel.findOneAndUpdate({ id: users.users[i].id }, { $inc: { receivedData: 1 } }, { returnDocument: 'after' });
                                    setUsers();

                                }, 100 * i);
                            }
                        }
                        await ConfigModel.findOneAndUpdate({ id: 1 }, { $inc: { sendedData: 1 } });
                        setConfig();
                    }, fixedDate - currentDate);
                }
            })
        }
        interval();

    } catch (err) {
        console.log(err);
    }
};

export const sendQuestion = async (user) => {
    try {
        const testNumber = user.completedTest;

        const { id } = user;
        const userId = id;

        if (user.qurrentQuestionIndex >= tests[testNumber].questions.length) {

            const message = `Данные по вашим ответам получены: \n ${user.tests[testNumber].wrongAnswers.length ?
                `Неверные ответы: ${user.tests[testNumber].wrongAnswers}` :
                'Ты молодец! Все ответы верные'}`;

            await bot.telegram.sendMessage(userId, message);

            user.completedTest++;

            await UserModel.findOneAndUpdate({
                id: userId
            },
                {
                    $inc: { completedTest: 1 }
                },
                {
                    returnDocument: 'after'
                })

            if ((user.completedTest < config.sendedData) && user.receivedData < config.sendedData) {
                await bot.telegram.sendMessage(userId, 'Через несколько секунд вы получите новое задание.');

                const lesson = lessons.lessons[user.completedTest];

                if (lesson.info) {
                    lesson.info.forEach(async (lessonItem, index) => {
                        const { image, text, preview, caption } = lessonItem;
                        const dateNow = new Date();
                        const lessonDate = new Date(lessonItem.time)
                        if (lessonDate > dateNow) {
                            return;
                        }
                        await sendData(userId, image, text, preview, caption);
                        if (index === (lesson.info.length - 1)) {
                             await UserModel.findOneAndUpdate({ id: userId }, { $inc: { receivedData: 1 } });
                        }
                    })
                } else {
                    const { image, text } = lesson;
                    setTimeout(async () => {
                        await sendData(userId, image, text);
                        await UserModel.findOneAndUpdate({ id: userId }, { $inc: { receivedData: 1 } });
                    }, 2000);
                }
            }

            await UserModel.findOneAndUpdate({
                id: userId
            },
                {
                    qurrentQuestionIndex: 0
                },
                {
                    returnDocument: 'after'
                });
            setUsers();
            return;
        }


        const currentQuestion = tests[testNumber].questions[user.qurrentQuestionIndex];

        const answerOptions = currentQuestion.answers.map((option, index) => {
            return [Markup.button.callback(option.text, option.value)]
        });

        if (currentQuestion.image) {
            await bot.telegram.sendPhoto(userId, { source: currentQuestion.image}, {
                caption: currentQuestion.question,
                parse_mode: 'HTML'
            });
        } else {
            await bot.telegram.sendMessage(userId, currentQuestion.question);
        }

        let buttons = await bot.telegram.sendMessage(userId, 'Варианты ответов: ', Markup.inlineKeyboard(
            [
                ...answerOptions
            ]
        ))

        user.messageToDelete.chatId = buttons.chat.id;
        user.messageToDelete.messageId = buttons.message_id;

        await UserModel.findOneAndUpdate({
            id: userId
        },
            {
                $set: { messageToDelete: { chatId: buttons.chat.id, messageId: buttons.message_id } }
            },
            {
                returnDocument: 'after'
            })

        setUsers();
    } catch (err) {
        console.log(err);
    }
};

export const checkCompletedTestsUser = async (ctx) => {
    try {
        const userId = ctx.message.from.id;
        const registeredUser = await UserModel.findOne({ id: userId });

        if (!registeredUser) {
            await ctx.reply('Вы не зарегистрированы');
            return false;
        }
        return registeredUser;

    } catch (err) {
        console.log(err);
    }
};