import UserModel from "../models/UserModel.js";


export const createUserBot = async (ctx) => {
    try {
        if (!ctx.message.from.username) {
            return
        }
        const doc = new UserModel({
            id: ctx.message.from.id,
            username: ctx.message.from.username,
            receivedData: 0,
            completedTest: 0,
            qurrentQuestionIndex: 0,
            score: 0,
            chatId: ctx.message.chat.id,
            firstMessage: ctx.message.message_id,
            messageToDelete: {
                chatId: null,
                messageId: null
            },
            tests: [
                {
                    id: 1,
                    rightAnswers: [],
                    wrongAnswers: [],
        
                },
                {
                    id: 2,
                    rightAnswers: [],
                    wrongAnswers: [],
        
                },
                {
                    id: 3,
                    rightAnswers: [],
                    wrongAnswers: [],
        
                },
                {
                    id: 4,
                    rightAnswers: [],
                    wrongAnswers: [],
        
                },
                {
                    id: 5,
                    rightAnswers: [],
                    wrongAnswers: [],
        
                },
                {
                    id: 6,
                    rightAnswers: [],
                    wrongAnswers: [],
        
                },
                {
                    id: 7,
                    rightAnswers: [],
                    wrongAnswers: [],
        
                },
                {
                    id: 8,
                    rightAnswers: [],
                    wrongAnswers: [],
        
                },
                {
                    id: 9,
                    rightAnswers: [],
                    wrongAnswers: [],
        
                }
            ]
        })

        const user = await doc.save();

    } catch (err) {
        console.log(err);
    }
}