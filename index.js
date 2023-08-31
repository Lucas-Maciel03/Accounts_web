const express = require('express')
const exphbs = require('express-handlebars')
const flash = require('express-flash')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const path = require('path'); // Importe o módulo 'path'

const app = express()

//import connection
const conn = require('./src/db/conn')

//import models
const User = require('./src/models/User')
const Transaction = require('./src/models/Transaction')

//import routes
const authRoutes = require('./src/routes/authRoutes')
const accountsRoutes = require('./src/routes/accountsRoutes')

//import controller apenas p acessar rota /
const AccountsController = require('./src/controllers/AccountsController')
const { checkAuth } = require('./src/helpers/checkAuth')

//config template engine
const hbs = exphbs.create({partialsDir: ['src/views/partials']})
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'src', 'views'));

//middlewares
app.use(express.urlencoded({extended: true}))
app.use(express.json())

//public path
app.use(express.static('src/public'))

//flash messages
app.use(flash())

//authenticate
app.use(
    session({
        name: 'session',
        secret: 'spfc_campeao_copa_brasil',
        resave: false,
        saveUninitialized: false,
        store: new FileStore({
            logFn: function(){}, //função de log, é necessaria para configurar seção por arquivos
            path: require('path').join(require('os').tmpdir(), 'sessions'), //é o caminho para a pasta sessions           
        }),
        cookie: ({
            secure: false,
            maxAge: 3600000,
            expires: new Date(Date.now() + 3600000), //vai expirar em 1 dia 
            httpOnly: true
        })
    })
)

//start session
app.use((req, res, next) => {
    if(req.session.userid){ //verifica se o user tem essa seção
        res.locals.session = req.session //pega a seção da req e manda pra res
    }
    
    next()
})

//routes
app.use('/', authRoutes)
app.use('/accounts', accountsRoutes)

app.get('/', checkAuth, AccountsController.showTransactions)

//start connection
conn.sync()
.then(() => {
    app.listen(3000, () => console.log('Listen in port 3000'))
})
.catch((error) => console.log(error))