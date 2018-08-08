var mongoose =  require('mongoose');
var transactionSchema = new mongoose.Schema({
    createdAt:{
        type: Date,
        default: Date.now
    },
    amount: String,
    action:{
        type:Number,
        default: 0
    },
    child:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        phoneNumber: String,
    },
    parent:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    }
});
var Transaction = mongoose.model('Transaction',transactionSchema);
module.exports = Transaction;