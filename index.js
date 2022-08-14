
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express')
const app = express();
const path = require('path');
const session=require('express-session')
const flash = require('connect-flash')
const booksRouter=require('./routers/books');
const authRouter = require('./routers/auth')
const morgan = require ('morgan');
const AsyncErr = require('./views/Error/AsyncErr')
const AppError = require('./views/Error/AppError')
const methodOverride= require('method-override')
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy=require('passport-local');
const User = require('./models/user')
const mongoSanitize=require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');


const dbUrl=process.env.DB_URL || "mongodb://localhost:27017/bookInv";
// const dbUrl="mongodb://localhost:27017/bookInv";


app.use(methodOverride('_method'))

const secret=process.env.secret ||'Thisisascret';


const sessionConfig={
    
    secret:secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    },
    store:MongoStore.create({
        mongoUrl:dbUrl,
        secret,
        touchAfter:24*60*60
    })
};

app.use(session(sessionConfig))
app.use(flash())
app.set('view engine','ejs')
app.set('views', path.join(__dirname , '/views'))
app.use(express.static( path.join(__dirname , 'public')))
app.use(mongoSanitize());

mongoose.connect(dbUrl,{
    useNewUrlParser: true, 
    useUnifiedTopology: true})
.then(()=>{
console.log('Database Connected Successfully')
})
.catch((err)=>{
    console.log('Cannot Connect to Database from index file')
    console.log(err)
})

//parsing Application data
app.use(express.urlencoded({extended:true}))
app.use(express.json())

//setting up passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
//flash middleware
app.use((req,res,next)=>{
    res.locals.success=req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser=req.user;
    next()
})
//using booksRouter
app.use('/books',booksRouter)
app.use('/user',authRouter)








// routing to home page
app.get('/', (req ,res,next)=>{
    try{
    res.render('Pages/home.ejs')}
    catch(e){   next(new AppError('Cannot Access Home.ejs file',404))}
})
//Error Handling
app.all('*',(req,res,next)=>{
  next(new AppError('Page Not Found', 404))
})
app.use((err,req,res,next)=>{
    if(!err.message){
        err.message='Oh! Boy error'
    }
    res.status(400).render('Error/errTemplate',{err})
})
app.listen(4040 , ()=> {
    console.log ('Listening on Port 4040')
})