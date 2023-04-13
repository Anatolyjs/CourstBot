import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';

import { config } from "../config.js";
import { users } from '../users.js';
import { createUserBot } from '../controllers/UserController.js';
import * as dataFunctions from '../sendDataFunctions/sendDataFunctions.js';
import { commands, helpCommand, registerMessage } from '../const.js';
import UserModel from '../models/UserModel.js';
import { setUsers } from '../setDataFromBD/setDataFromBD.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

export const start = async (ctx) => {
    try {
        const name = ctx.message.from.first_name ? ctx.message.from.first_name : '';
        ctx.replyWithHTML(`Привет, ${name}. Чтобы взаимодействовать с ботом мини-курса, используй следующие команды: \n ${commands}`);
    } catch (err) {
        console.log(err);
    }
};

export const register = async (ctx) => {
    try {
        const currentDate = new Date();
        const deadline = new Date(config.registerDeadline);

        const name = ctx.message.from.first_name ? ctx.message.from.first_name : 'друг';

        if ((deadline - currentDate) < 0) {
            return ctx.reply(`К сожалению, ${name}. Регистрация на мини-курс от команды Trade Soul уже закрыта!`);
        }

        const userId = ctx.message.from.id;
        let user_channel_status;

        try {
            user_channel_status = await bot.telegram.getChatMember(config.channel, userId);
        } catch (err) {
            console.log('user not found');
        }

        const isUserRegistered = users.users.find((user) => user.id === userId);

        if (isUserRegistered) {
            return ctx.reply('Вы уже зарегистрированы');
        }

        if (!user_channel_status.status) {
            return ctx.reply('Вы не подписаны на канал https://t.me/trade_soul, пожалуйста, подпишитесь для дальнейшей регистрации!');
        }

        if (user_channel_status.status === 'left') {
            return ctx.reply('Вы не подписаны на канал https://t.me/trade_soul, пожалуйста, подпишитесь для дальнейшей регистрации!');
        }

        await createUserBot(ctx);

        const photo1 = { type: 'photo', media: { source: './utils/image/preview1.jpg' } };
        const photo2 = { type: 'photo', media: { source: './utils/image/preview2.jpg', caption: registerMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true} };
        const mediaGroup = [photo1, photo2];

        await ctx.replyWithMediaGroup(mediaGroup);
        await ctx.replyWithHTML(registerMessage, {disable_web_page_preview: true})
        await setUsers();
    } catch (err) {
        console.log(err);
    }
};

export const test = async (ctx) => {
    const registeredUser = await dataFunctions.checkCompletedTestsUser(ctx);
    if (!registeredUser) {
        return;
    }

    if (registeredUser.completedTest === registeredUser.receivedData) {
        return ctx.reply('Вы выполнили все актуальные тесты');
    }

    if (registeredUser.messageToDelete.chatId && registeredUser.messageToDelete.messageId) {
        try {
            await bot.telegram.deleteMessage(registeredUser.messageToDelete.chatId, registeredUser.messageToDelete.messageId);
        } catch (err) {
            console.log(err);
        }
    }
    dataFunctions.sendQuestion(registeredUser);
};

export const deleteAll = async (ctx) => {
    try {
        // users.users.forEach(user => {
        //     const messagesLimit = user.firstMessage + 200;
        //     const chatId = user.chatId;
        //     for (let i = user.firstMessage; i < messagesLimit; i++) {
        //         try {
        //             bot.telegram.deleteMessage(chatId, i)
        //         } catch (err) {
        //             console.log('ops')
        //         }
        //     }
        // });
    } catch (err) {
        console.log('opppps')
    }
};

export const rating = async (ctx) => {
    try {
        if (ctx.message.from.id !== config.adminId) {
            return;
        }
        const users = await UserModel.find();

        const newArr = users.sort((a, b) => b.score - a.score);

        const limit = newArr.length > 50 ? 50 : newArr.length;

        let string = ``;
        for (let i = 0; i < limit; i++) {
            string += `${i + 1}. @${newArr[i].username} - ${newArr[i].score}\n`
        }
        await ctx.reply(string);
    } catch (err) {
        console.log('ops');
    }
};

export const getUsersCount = async (ctx) => {
    try {
        if (ctx.message.from.id !== config.adminId) {
            return;
        }

        const users = await UserModel.find();
        const usersCompletedTests = users.filter((user) => user.completedTest === config.sendedData);

        await ctx.reply(`Всего зарегистрировалось пользователей: ${users.length}. Выполнили все текущие тесты: ${usersCompletedTests.length}`);
    } catch (err) {
        console.log(err);
    }
};

export const help = async (ctx) => {
    ctx.replyWithHTML(helpCommand)
};
