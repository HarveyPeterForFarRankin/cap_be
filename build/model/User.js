"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mongoose = require('mongoose');
var UserSchema = new Mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    role: {
        type: String,
        default: 'Basic',
        required: true,
    },
});
var User = Mongoose.model('user', UserSchema);
module.exports = User;
