const User = require('../models/User')
const Transaction = require('../models/Transaction')

module.exports = class AccountsController{
    static async showTransactions(req, res){
        const id = req.session.userid
        const user = await User.findOne({where: {id}, raw: true})
        const balance = user.balance

        // const user = req.user
        // console.log('fala', user)

        res.render('transactions/home', {balance})
    }

    static deposit(req, res){
        const balance = req.user.balance
        res.render('transactions/deposit', {balance})
    }

    static async depositPost(req, res){
        const amount = parseFloat(req.body.amount)
        const type = req.body.type
        const id = req.session.userid   
        
        if(isNaN(amount)){
            req.flash('message', 'O valor informado não é um número, tente novamente!')
            res.render('transactions/deposit')
            return
        }
        
        if(amount === 0){
            req.flash('message', 'O valor informado é inválido, tente novamente!')
            res.redirect('/accounts/deposit')
            return
        }

        try {
            //Inserindo deposito na tabela User
            const userData = await User.findOne({where: {id}, raw: true})
            const user = {
                balance: amount + parseFloat(userData.balance)
            } 

            await User.update(user, {where: {id}})

            //Criando registro de deposito na tabela transaction
            await Transaction.create({amount, type, receiverId: id})

            req.flash('message', 'Deposito feito com sucesso!')

            req.session.save(() => {
                res.redirect('/accounts/deposit')
            })
        } catch (error) {
            console.log(error)
        }
    }
}