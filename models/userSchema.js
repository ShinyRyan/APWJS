/*
userSchema.js
@author: Ryan McConnell
version: 05/03/2021
*/
let mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, 'Please provide a username for yourself']
    },
    password: {
        type: String,
        required: [true, 'Do you want people to steal your identity?']
    },
    best_time: {
        type: Number,
        default: 86400 
    },
    win_counter: {
        type: Number,
        default: 0
    },
    loss_counter: {
        type: Number,
        default: 0
    },
    email: {
        type: String,
        required: [true]
    },
    email_verified: {
        type: Boolean,
        default: false
    }
});
const users=mongoose.model('User', userSchema, 'user');

module.exports = users;
//By Ryan McConnell