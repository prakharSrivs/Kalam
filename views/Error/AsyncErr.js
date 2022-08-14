module.exports = function AsyncErr(fn){
    return function (req,res,next){
    fn(req,res,next).catch((e)=>{
        next(e)
    })
    }
}