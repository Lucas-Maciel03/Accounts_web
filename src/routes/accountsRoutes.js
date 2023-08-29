const express = require('express')
const router = express.Router()

const AccountsController = require('../controllers/AccountsController')
const checkAuth = require('../helpers/checkAuth').checkAuth

router.get('/', AccountsController.showTransactions)

module.exports = router
