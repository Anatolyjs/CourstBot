import dotenv from 'dotenv';
import { Telegraf} from 'telegraf';

import lessons from '../lessons/index.js';
import { users } from '../users.js';
import UserModel from '../models/UserModel.js';
import { setConfig, setUsers } from '../setDataFromBD/setDataFromBD.js'
import ConfigModel from '../models/ConfigModel.js';

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
            const sendPhoto = async () => {
                try {
                    await bot.telegram.sendPhoto(to, { source: photo }, {
                        caption: caption,
                        parse_mode: 'HTML'
                    });
                } catch (err) {
                    console.log('Не получилось отправить фото');
                }
            }

            await checkingSendMessage(to, to, sendPhoto);
           
            return;
        } catch (err) {
            console.log(err);
            return
        }
    }
    if (info) {
        try {
            if (preview) {
                const sendInfo = async () => {
                    try {
                        await bot.telegram.sendMessage(to, info, { parse_mode: 'HTML', disable_web_page_preview: preview });
                    } catch(err) {
                        console.log('Не получилось отправить материал', err); 
                    }
                }

                await checkingSendMessage(to, to, sendInfo);
            } else {
                const sendInfo = async () => {
                    try {
                        await bot.telegram.sendMessage(to, info, { parse_mode: 'HTML' });
                    } catch(err) {
                       console.log('Не получилось отправить материал', err); 
                    }
                }

                await checkingSendMessage(to, to, sendInfo);
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
                                    const sendInfo = async () => {
                                        await sendData(users.users[i].id, lessonItem.image, lessonItem.text, lessonItem.preview, lessonItem.caption);
                                        if (indexItem === lesson.info.length - 1) {
                                            await UserModel.findOneAndUpdate({ id: users.users[i].id }, { $inc: { receivedData: 1 } }, { returnDocument: 'after' });
                                            await setUsers();
                                        }
                                    }
                                    await checkingSendMessage(users.users[i].chatId, users.users[i].id, sendInfo);

                                } catch (err) {
                                    console.log(err);
                                }
                            }, 200 * i);
                        }
                        if (indexItem === 0) {
                            await ConfigModel.findOneAndUpdate({ id: 1 }, { $inc: { sendedData: 1 } });
                            setUsers();
                        }
                        setConfig();
                    }, fixedDate - currentDate);
                })

            })
        }
        interval();

    } catch (err) {
        console.log(err);
    }
};


const sendInfoForUsers = () => {
    for (let i = 0; i < users.users.length; i++) {
        setTimeout(async () => {
            try {
                const sendInfo = async () => {
                    await sendData(users.users[i].id, lessonItem.image, lessonItem.text, lessonItem.preview, lessonItem.caption)
                }
                await checkingSendMessage(users.users[i].chatId, users.users[i].id, sendInfo);

            } catch (err) {
                console.log(err);
            }
        }, 200 * i);
    }
}