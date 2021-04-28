let mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, `Oh word? I don't know until you tell me`]
    },
    hintList: {
        type: [Number],
        required: true
    },
    submittedBy: String
});
const words=mongoose.model('Word', wordSchema, 'words');

module.exports = words;