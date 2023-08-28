const {DataTypes} = require('sequelize')

const db = require('../db/conn')

const User = db.define('User', {
    name: {
        type: DataTypes.STRING,
        required: true
    },
    email: {
        type: DataTypes.STRING,
        required: true
    },
    password: {
        type: DataTypes.STRING,
        required: true
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2), //DECIMAL com até 10 dígitos no total e 2 dígitos à direita do ponto decimal
        defaultValue: 0.00 //Valor padrão do saldo é 0
    }
})

module.exports = User
