const express = require('express');
const router = express.Router()
const AsyncErr = require('../views/Error/AsyncErr');
const passport = require('passport')
const User = require('../models/user')

router.get('/register',(req,res)=>{
    res.render('Pages/register.ejs')
})
router.post('/register',AsyncErr(async(req,res,next)=>{
    try{
    const {username , email , password}=req.body;
    const user = new User({email , username})
    const newUser = await User.register(user,password)
    const backUrl=req.originalUrl || '/books';
    req.login(newUser,err=>{
        if(err) return next(err);
        req.flash('success','Successfully Registered')
        res.redirect('/books')
    })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/user/register')
    }
   
}))
router.get('/login',(req,res)=>{
    res.render('Pages/login.ejs')
})
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/user/login' }),(req,res)=>{
    req.flash('success','Successfully Logged You In')
    delete req.session.returnTo
    res.redirect('/books')
})
router.get('/logout',(req,res)=>{
    req.logout()
    req.flash('success','Successfully Logged you out')
    res.redirect('/books')
})


module.exports = router;