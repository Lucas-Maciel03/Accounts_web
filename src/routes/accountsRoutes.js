const express = require('express')
const router = express.Router()

const AccountsController = require('../controllers/AccountsController')
const checkAuth = require('../helpers/checkAuth').checkAuth
const getUserBalance = require('../helpers/getUserBalance')

router.get('/deposit',  checkAuth, getUserBalance, AccountsController.deposit)
router.post('/deposit', checkAuth, AccountsController.depositPost)
router.get('/', getUserBalance, AccountsController.showTransactions)

module.exports = router
