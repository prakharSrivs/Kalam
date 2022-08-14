const express= require('express')
const router = express.Router();
const Book = require('../models/books')
const Review = require('../models/review'); 
const flash = require('connect-flash')
const {isLoggedIn} = require('../views/Middlewares/middleware')
//importing Error Handler Class AppError and AsyncError
const AppError = require('../views/Error/AppError');
const AsyncErr = require('../views/Error/AsyncErr');




//Importing JOI as  a middleware for Books and Reviews server side error handling 
const {bookSchema}=require('../Schemas/joiSchema')
const {reviewSchema}=require('../Schemas/reviewJOI');
const { append } = require('express/lib/response');
const User = require('../models/user');




// validating joi schema as a middleware
const validateBookData = (req,res,next)=>{
    const { error}= bookSchema.validate(req.body);
    if(error){
    const msg = error.details.map(el=> el.message).join(',');
    console.log(msg);
    throw (new AppError(msg,400))
    }
    else {
    return next()
 }
 }
 const validateReviews = (req,res,next)=>{
     const {error} = reviewSchema.validate(req.body);
     if(error){
         const msg = error.details.map(el=> el.message).join(',');
         console.log(msg);
         throw (new AppError(msg,400))
         }
         else {
         next()
 }
 }


//routing to Books Page
router.get('',AsyncErr(async (req,res)=>{
    let allBooks =await Book.find()
    res.render('Pages/books.ejs',{allBooks})
}))


//routing to the form page of adding book
router.get('/addBook',isLoggedIn,(req,res)=>{
    try{
   res.render('Pages/add.ejs'); }
   catch(e){
    throw new AppError('Doc Not Found',404)
   }
})

//routing to the page for opening a single book
router.get('/:id',AsyncErr(async(req,res)=>{
    const {id}= req.params;
    const allReviews = await Review.find().populate('author').then(c=> (c))
    const reviews = [];
    let i=0
    for(review of allReviews)
    {   if(review.bookId==id)
        {reviews[i]=review;
        i++;}}
    const book = await Book.findById(id).populate('seller').then(c => c)
    console.log(book)
    res.render('Pages/singleBook.ejs',{book,reviews})
}))



//ro-uting for deleting a specific single review
router.get('/:id/review/:rid',isLoggedIn,AsyncErr(async(req,res)=>{
    const {id,rid}=req.params;
    const delReview = await Review.findByIdAndDelete(rid);
    if(delReview)
    req.flash('success','Review Deleted')
    console.log('review deleted ',delReview);
    res.redirect(`/books/${id}`)
}))



//adding review and redirecting to that specific book
router.patch('/:id/add',isLoggedIn,validateReviews,AsyncErr(async(req,res,next)=>{
    const data = req.body;
    const [rev] =await Review.insertMany(data);
    const {id} = req.params;
    const book =await Book.findById(id)
    rev.bookId=book;
    rev.author=req.user.id;
    await rev.save()
    req.flash('success','Review Added')
    res.redirect(`/books/${book._id}`)
}))


//inserting data into the database
router.patch('/addBook',isLoggedIn,validateBookData,AsyncErr(async(req,res)=>{
    console.log(req.body)
    const {title,description,image_source}=req.body;
    const addBook = new Book({title:title,description:description,image_source:image_source});
    addBook.seller=req.user.id;
    await addBook.save()
    console.log("Data Created ",addBook)
    req.flash('success','Book Added Successfully')
    res.redirect('/books/addBook')
}))



//routing to the deletion of book from the database
router.delete('/:id',isLoggedIn,AsyncErr(async(req,res)=>{
    const {id} = req.params
    const book =await Book.findByIdAndDelete(id)
    console.log('Book Data Deleted',book)
    req.flash('success','Book Deleted Successfully')
    res.redirect('/books')
}))
module.exports = router;