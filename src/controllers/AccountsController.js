const User = require('../models/User')
const Transaction = require('../models/Transaction')

module.exports = class AccountsController{
    static showTransactions(req, res){
        res.render('transactions/home')
    }
}