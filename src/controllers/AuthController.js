const User = require('../models/User')
const bcrypt = require('bcryptjs')

module.exports = class AuthController{
    static register(req, res){
        const next = true

        req.flash('message', 'OBS: A senha deve ter 6 digitos!')
        res.render('auth/register', {next})
    }
    
    static async registerPost(req, res){
        const {name, email, password, confirmpassword} = req.body
        let next = true

        const checkifExists = await User.findOne({where: {email}})

        //checar se o usuario ja está cadastrado
        if(checkifExists){
            next = false

            req.flash('message', 'Não foi possivel cadastrar, usuario ja existe!')
            res.render('auth/register', {next, name, email, password, confirmpassword})

            return
        }

        //verificando se a senha está no padrão
        if(password.length != 6 ){
            next = false
            
            req.flash('message', 'A senha deve conter exatamente 6 digitos!')
            res.render('auth/register', {next, name, email, password, confirmpassword})

            return
        }

        //verificando se a senha e a confirmação estao iguais
        if(password != confirmpassword){
            next = false

            req.flash('message', 'As senhas não conferem, tente novamente!')
            res.render('auth/register', {next, name, email, password, confirmpassword})

            return
        }
        
        try {
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(password, salt)

            const user = {
                name,
                email,
                password: hashedPassword
            }

            const createdUser = await User.create(user)

            req.session.userid = createdUser.id

            req.session.save(() => {
                res.redirect('/')
            })

        } catch (error) {
            console.log(error)
        }

    }

    static login(req, res){
        const next = true
        res.render('auth/login', {next})
    }

    static async loginPost(req, res){
        try {
            const {email, password} = req.body
            let next = true

            const checkifExists = await User.findOne({where: {email}})
            //verificando se o usuario existe
            if(!checkifExists){
                next = false

                req.flash('message', 'Usuario não encontrado, tente novamente!')
                res.render('auth/login', {next, email, password})

                return
            }

            const comparePassword = bcrypt.compareSync(password, checkifExists.password)

            if(!comparePassword){
                next = false

                req.flash('message', 'A senha está incorreta, tente novamente!')
                res.render('auth/login', {next, email, password})

                return
            }
        
            req.session.userid = checkifExists.id

            req.flash('message', 'Login realizado com sucesso!')

            req.session.save(() => {
                res.redirect('/')
            })
        } catch (error) {
            console.log(error)
        }
    }

    static logout(req, res){
        req.session.destroy()
        res.redirect('/login')
    }
}