const express = require('express')
const router = express.Router()

const AccountsController = require('../controllers/AccountsController')
const checkAuth = require('../helpers/checkAuth').checkAuth
const getUserBalance = require('../helpers/getUserBalance')

router.get('/deposit',  checkAuth, getUserBalance, AccountsController.deposit)
router.post('/deposit', checkAuth, AccountsController.depositPost)
router.get('/withdraw',  checkAuth, getUserBalance, AccountsController.withdraw)
router.post('/withdraw',  checkAuth, AccountsController.withdrawPost)
router.get('/transfer', checkAuth, getUserBalance, AccountsController.transfer)
router.post('/transfer', checkAuth, AccountsController.transferPost)
router.get('/', getUserBalance, AccountsController.showTransactions)

module.exports = router
