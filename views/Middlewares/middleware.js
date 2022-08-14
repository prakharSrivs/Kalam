module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        console.log(req.user)
        req.flash('error','You Must Be Signed In')
        req.session.returnTo=req.originalUrl;
        return res.redirect('/user/login')
    }
    next()
}