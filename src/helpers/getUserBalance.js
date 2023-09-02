const User = require('../models/User')

module.exports = async function getUserBalance(req, res, next){
    try {
        const id = req.session.userid;
        const user = await User.findOne({where: {id}, raw: true})
        req.user = user
        next()
    } catch (error) {
        console.log(error)
       
    }
}
