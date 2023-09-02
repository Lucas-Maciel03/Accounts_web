const User = require('../models/User')
const Transaction = require('../models/Transaction')

const {Op} = require('sequelize')

module.exports = class AccountsController{
    static async showTransactions(req, res){
        const id = req.session.userid
        const user = await User.findOne({where: {id}, raw: true})
        const balance = user.balance

        const transactionsData = await Transaction.findAll({
            where: {[Op.or]: [
                {senderId: id},
                {receiverId: id}
            ]},
            include: [
                {
                  model: User,
                  as: 'receiver', // Defina um alias para a associação
                  required: false
                }
              ]
        })

        const transaction = transactionsData.map((response) => response.get({plain: true}))
        
        //formatando datas
        transaction.forEach((result) => {
            const rawDate = result.createdAt
            const formattedDate = new Date(rawDate).toLocaleString('pt-BR', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
            })
            const formattedMonth = formattedDate.split(' ')[2];
            const uppercaseMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);
            const finalFormattedDate = `${formattedDate.split(' ')[0]} ${uppercaseMonth} ${formattedDate.split(' ')[4]}`;

            result.createdAt = finalFormattedDate
        })

        res.render('transactions/home', {balance, transaction})
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
            
        if(amount === 0 || amount < 0){
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

            req.flash('message', `Você depositou R$ ${amount} na sua conta!`)

            req.session.save(() => {
                res.redirect('/accounts/deposit')
            })
        } catch (error) {
            console.log(error)
        }
    }

    static withdraw(req, res){
        const balance = req.user.balance
        res.render('transactions/withdraw', {balance})
    }

    static async withdrawPost(req, res){
        const id = req.session.userid
        const amount = parseFloat(req.body.amount)
        const type = req.body.type

        if(isNaN(amount)){
            req.flash('message', 'O valor informado não é um número, tente novamente!')
            res.render('transactions/withdraw')
            return
        }

        if(amount === 0 || amount < 0){
            req.flash('message', 'O valor informado é inválido, tente novamente!')
            res.redirect('/accounts/withdraw')
            return
        }

        try {
            const userData = await User.findOne({where: {id}, raw: true})

            const user = {balance: parseFloat(userData.balance) - amount}
            await User.update(user, {where: {id}})

            //Criando registro de saque na tabela transaction
            await Transaction.create({amount, type, receiverId: id})

            req.flash('message', `Você sacou R$ ${amount} da sua conta!`)

            req.session.save(() => {
                res.redirect('/accounts/withdraw')
            })
        } catch (error) {
            console.log(error)
        }
    }

    static transfer(req, res){
        const balance = req.user.balance
        res.render('transactions/transfer', {balance})
    }

    static async transferPost(req, res){
        const id = req.session.userid
        const amount = parseFloat(req.body.amount)
        const email = req.body.email
        const type = req.body.type

        if(isNaN(amount)){
            req.flash('message', 'O valor informado não é um número, tente novamente!')
            res.render('transactions/withdraw')
            return
        }

        if(amount === 0 || amount < 0){
            req.flash('message', 'O valor informado é inválido, tente novamente!')
            res.redirect('/accounts/withdraw')
            return
        }
        
        //check if userReceiver exists
        const userReceiver = await User.findOne({where: {email}, raw:true})
        if(!userReceiver){
            req.flash('message', 'Usuário destinatário não existe, tente novamante!')
            res.redirect('/accounts/transfer')
            return
        }

        //buscando dados do userSender
        const userSender = await User.findOne({where: {id}, raw: true})
        if(userReceiver.email === userSender.email){
            req.flash('message', 'Você não pode transferir para si mesmo, tente novamante!')
            res.redirect('/accounts/transfer')
            return
        }

        if(userSender.balance < amount){
            req.flash('message', 'Você não tem saldo suficiente para realizar essa transfêrencia, tente novamante!')
            res.redirect('/accounts/transfer')
            return
        }

        try {
            const userSenderBalance = {
                balance: parseFloat(userSender.balance) - amount
            }
            const userReceiverBalance = {
                balance: parseFloat(userReceiver.balance) + amount
            }

            //add amount in userReceiver
            await User.update(userReceiverBalance, {where: {email}})

            //remove amount in userSender
            await User.update(userSenderBalance, {where: {id}})

            //criando registro na tabela transaction
            await Transaction.create({amount, type, senderId: id, receiverId: userReceiver.id})

            req.flash('message', `Você transferiu R$ ${amount} para ${userReceiver.name}!`)

            req.session.save(() => {
                res.redirect('/accounts/transfer')
            })
        } catch (error) {
            console.log(error)
        }
        
    }
}