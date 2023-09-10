require('dotenv').config()
const express = require('express')
const session = require('express-session')
const cookies = require('cookie-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const MySQLStore = require('express-mysql-session')(session);
const passport = require('./controllers/UserLoginLocalController').passport
const path = require('path')
// const client = require('twilio')
// (process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const app = express()

//mysql session store
const sessionStore = new MySQLStore({
    host: process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE_NAME,
    createDatabaseTable:true,
    //expiration:1000*60*60*24,
    schema:{
        tableName:"session_process",
        columnNames:{
            session_id:"session_id",
            expires : "expires",
            data:"data"
        }
    }
})

//middlwares
app.disable('X-Powered-By')
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(session({
    name:'user',
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    store:sessionStore,
    cookie:{
        sameSite:true,
        httpOnly:true,
    }
}))
app.use(cookies())
app.use(cors({
    credentials:true,
    origin:['https://MohamedEmadEldeen09.github.io/auth_app'],
}))
app.use(fileUpload({
    createParentPath:true,
}))
app.use(passport.initialize())
app.use(passport.session())

//routes
//user in general --focus on registration and sign up process and change profile image
app.use('/user' , require('./routes/UserRoute'))
//user login process
app.use('/user/auth' , require('./routes/UserLoginLocalRoute'))
//user update profile credentials
app.use('/user/profile' , require('./routes/UserUpdateProfileRoute'))


app.listen( process.env.PORT ,()=>{
  console.log('Backend server is runing on port '+process.env.PORT);
})