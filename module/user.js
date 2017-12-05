var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required: true
    },
    password: String,
    isAdmin:{
        type: Boolean,
        default: false
    }
});
userSchema.plugin(passportLocalMongoose);
var User = mongoose.model('User', userSchema);
module.exports = User;