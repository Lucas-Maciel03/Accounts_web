const {Sequelize} = require('sequelize')

const sequelize = new Sequelize('accounts', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})


try {
    sequelize.authenticate()
    console.log('Conectado ao Banco!')
} catch (error) {
    console.log(error)
}

module.exports = sequelize
