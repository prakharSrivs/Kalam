const mongoose = require('mongoose')
const Review = require('./review')

const booksSchema = new mongoose.Schema({
    title :{
        type:String ,
        required:true
    } ,
    description :{
        type :String ,
        required:true
    } ,
    image_source :{
        type:String,
        required:true
    },
    seller:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
})
booksSchema.post('findOneAndDelete',async function(doc){
    const delReviews =  await  Review.deleteMany({bookId:doc._id})
    console.log(delReviews)
    console.log('Reviews Deleted')
})

const Book =mongoose.model('Book',booksSchema )
module.exports = Book ;