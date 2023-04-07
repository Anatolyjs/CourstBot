import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true 
    },
    username: {
        type: String,
        required: true
    },
    receivedData: {
        type: Number,
        required: true
    },
    completedTest: {
        type: Number,
        required: true
    },
    qurrentQuestionIndex: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    messageToDelete: {
        chatId: Number,
        messageId: Number
    },
    chatId: {
        type: Number,
        required: true
    },
    firstMessage: {
        type: Number,
        required: true
    },
    tests: [
        {
            id: Number,
            rightAnswers: {
                type: Array, 
                default: []
            },
            wrongAnswers: {
                type: Array, 
                default: []
            },

        },
        {
            id: Number,
            rightAnswers: {
                type: Array, 
                default: []
            },
            wrongAnswers: {
                type: Array, 
                default: []
            },

        },
        {
            id: Number,
            rightAnswers: {
                type: Array, 
                default: []
            },
            wrongAnswers: {
                type: Array, 
                default: []
            },

        },
        {
            id: Number,
            rightAnswers: {
                type: Array, 
                default: []
            },
            wrongAnswers: {
                type: Array, 
                default: []
            },

        },
        {
            id: Number,
            rightAnswers: {
                type: Array, 
                default: []
            },
            wrongAnswers: {
                type: Array, 
                default: []
            },

        },
        {
            id: Number,
            rightAnswers: {
                type: Array, 
                default: []
            },
            wrongAnswers: {
                type: Array, 
                default: []
            },

        },
        {
            id: Number,
            rightAnswers: {
                type: Array, 
                default: []
            },
            wrongAnswers: {
                type: Array, 
                default: []
            },

        },
        {
            id: Number,
            rightAnswers: {
                type: Array, 
                default: []
            },
            wrongAnswers: {
                type: Array, 
                default: []
            },

        },
        {
            id: Number,
            rightAnswers: {
                type: Array, 
                default: []
            },
            wrongAnswers: {
                type: Array, 
                default: []
            },

        }
    ]
});

export default mongoose.model('User', UserSchema);