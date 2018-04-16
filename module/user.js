var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    idNumber: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    parentIdNumber: {
        type:String,
        unique: false,
        required: false
    },
    nextLevel:[this],
    income: Number,
    incomeDetails:[
        {
            createdAt:{
                type: Date,
                default: Date.now
            },
            childName: String,
            childIdNumber: String,
            level: String,
            amount: String
        }
    ],
    isAdmin: {
        type: Boolean,
        default: false
    }
});
userSchema.plugin(passportLocalMongoose);
var User = mongoose.model('User', userSchema);
module.exports = User;