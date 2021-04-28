let mongoose = require('mongoose');

const hintSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, 'Take a hint... How about you add one?']
    },
    hint_id: {
        type: Number,
        required: [true, `You probably won't see this, but I gotta track ya hint somehow`]
    },
    submittedBy: String
});
const hints=mongoose.model('Hint', hintSchema, 'hints');

module.exports = hints;