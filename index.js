const express = require('express')
const app = express()
const path = require('path')
const hbs = require('express-handlebars')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
}))

app.use(express.static('public'))

const mysql = require('mysql')

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}))

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "parool",
    database: "money_test2"
})

con.connect(function (err) {
    if (err) throw err
    console.log("connected")
})

const articleRoutes = require('./routes/money')

app.use('/', articleRoutes)
app.use('/dashboard', articleRoutes)

app.listen(3050, () => {
    console.log("App started")
})