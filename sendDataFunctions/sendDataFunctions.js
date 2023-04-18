import dotenv from 'dotenv';
import { Telegraf} from 'telegraf';

import lessons from '../lessons/index.js';
import { users } from '../users.js';
import UserModel from '../models/UserModel.js';
import {setUsers } from '../setDataFromBD/setDataFromBD.js'

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

export const checkingSendMessage = async (chatId, userId, callback) => {
    const member = await bot.telegram.getChatMember(chatId, userId);
    if (member.status === 'member' || member.status === 'administrator' || member.status === 'creator') {
        callback();
        return 1;
    }
    return 0;
}

const sendData = async (to, photo, info, preview, caption) => {
    if (photo) {
        try {
            await bot.telegram.sendPhoto(to, { source: photo }, {
                caption: caption,
                parse_mode: 'HTML'
            });
        } catch (err) {
            console.log('Не получилось отправить фото');
        }
    }
    if (info) {
        try {
            if (preview) {
                bot.telegram.sendMessage(to, info, { parse_mode: 'HTML', disable_web_page_preview: preview }).then(async (res) => {
                    await UserModel.updateOne({ id: to }, { $inc: { receivedData: 1 }});
                }).catch((err) => {
                    console.log('Информация не отправилась и пользователь в бд не обновился', err);
                });
            } else {
                bot.telegram.sendMessage(to, info, { parse_mode: 'HTML' }).then(async (res) => {
                    await UserModel.updateOne({ id: to }, { $inc: { receivedData: 1 }});
                }).catch((err) => {
                    console.log('Информация не отправилась и пользователь в бд не обновился', err);
                });;
            }
        } catch (err) {
            console.log('Не получилось отправить материал', err);
        }
    }
};

export const sendMaterial = async () => {
    try {
        const interval = async () => {
            lessons.lessons.forEach(async (lesson, index) => {
                lesson.info.forEach((lessonItem, indexItem) => {
                    let currentDate = new Date();
                    const fixedDate = new Date(lessonItem.time);

                    if (fixedDate - currentDate < 0) {
                        return;
                    }

                    setTimeout(async () => {
                        for (let i = 0; i < users.users.length; i++) {
                            setTimeout(async () => {
                                try {
                                    await sendData(users.users[i].id, lessonItem.image, lessonItem.text, lessonItem.preview, lessonItem.caption);
                                    if (i === users.users.length - 1) {
                                        await setUsers();
                                    }
                                } catch (err) {
                                    console.log(err);
                                }
                            }, 200 * i);
                        }
                    }, fixedDate - currentDate);
                })

            })
        }
        interval();

    } catch (err) {
        console.log(err);
    }
};


// export const sendInfoForUsers = async () => {
//     const lesson = lessons.lessons[0].info[0];
//     sendData(74865471,  null, 'info', null, null);
//     // for (let i = 0; i < users.users.length; i++) {
//     //     setTimeout(async () => {
//     //         try {
//     //             console.log(users.users[i].receivedData)
//     //             if (users.users[i].receivedData === 2) {
//     //                 console.log('Отправляем данные пользователю', users.users[i].id);
//     //                 try {
//     //                     await sendData(users.users[i].id, lesson.image, lesson.text, lesson.preview, lesson.caption);
//     //                     await UserModel.updateOne({ id: users.users[i].id }, { $inc: { receivedData: 1 }});
//     //                     await setUsers();
//     //                 }
//     //                 catch (err) {
//     //                     console.log('Не получилось')
//     //                 }
//     //             }
//     //         } catch (err) {
//     //             console.log(err);
//     //         }
//     //     }, 100);
//     // }
// };