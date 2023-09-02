const {DataTypes} = require('sequelize')

const User = require('./User')

const db = require('../db/conn')

const Transaction = db.define('Transaction', {
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        required: true,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false
    },
})

User.hasMany(Transaction, { foreignKey: 'senderId', as: 'sentTransactions' });
User.hasMany(Transaction, { foreignKey: 'receiverId', as: 'receivedTransactions' });

Transaction.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Transaction.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

module.exports = Transaction
