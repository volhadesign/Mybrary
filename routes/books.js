const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')//we requre a library that is build in node.js for images upload
const fs = require('fs')//library that build in the node. If we have an error saving a book we want to be sure that we removed the bookcover from db. fs -file sysem

//require local modules
const Book = require('../models/book')
const Author = require('../models/author')

const uploadPath = path.join('public', Book.coverImageBasePath)//this uploadPath is going to go from our public folder into coverImageBasePath
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']//array of image types our server is gonna to accept
const upload = multer({
  dest: uploadPath, //tell where the upload is going to be
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));//to filter the files that the server can accept. We need callback after we done with a filefilter. null means we don't have any error. We need boolean to determine if the file is accepted (true) or not (faulse)
  }

})//here we configure multer in order to use in our project


//authors folder in the views folder contains all views for author route
//All Books Route

router.get('/', async (req, res) => {//we use asyncronise function because they help to work with mongoose much easier
  let query = Book.find()// if in find we don't pass anything this will return a query object
  //chech if our request contains parameters we want
  //filtering all entered info
  if(req.query.title != null && req.query.title != ""){
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if(req.query.publishedBefore != null && req.query.publishedBefore != ""){
    query = query.lte('publishDate', req.query.publishedBefore)
  }//filters for published dates. We want to check publishDate in our db. If the publishDate is less or equal to the publishedBefore date then we want to return this object
  if(req.query.publishedAfter != null && req.query.publishedAfter != ""){
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })

  } catch {
  res.redirect('/');
  }

})
//New Book Router. This route is for displaying the form where you can add a book
router.get('/new', async (req, res) => {//in the result it will be books/new
renderNewPage(res, new Book())//we're passing new book here and there won't be any error
})
//Create Book Route
//the name of the input is cover so we specify it here. It tells multer that we're going to upload a single file called cover. It going to do all the work behind the sceine: to create this file, upload it on the server and put it into correct folder. This library is going to add a variable to our request here which is called "file"(req.file)
router.post('/', upload.single('cover'),
 async (req, res) => {//asyncronise function
  const fileName = req.file != null ? req.file.filename : null//we're getting a file name from the file if it is exist we can use this file name here to set our coverImageName
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),//publish date will return a string and we convert this string to the Date object
    pageCount: req.body.pageCount,
    coverImageName: fileName,//we first need to create the cover image file on our file system  get the name from it and save it into the book object. The easiest way to do this is to use a library called multer.   if we uploaded the file it will be equal to the name of the file  if we didn't upload the file it will be equal to null so we can send an error
    description: req.body.description
  })//here we don't put the cover into this object yet because first we need to create the cover image file in the file system get the name from it and then save it into the book object. the easier way to do this is to use the library multer in order to create an actual file
try {
  const newBook = await book.save()
  //res.redirect(`books/${newBook.id}`)
  res.redirect('/books')

} catch(e) {
  console.error(e)
  if (book.coverImageName != null) {
  removeBookCover(book.coverImageName)
  }
  renderNewPage(res, book, true)//we are passing existing book object and this does has an error
}
})

function removeBookCover(fileName){
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err);
    }) //this will remove the file that we don't want anymore on server(because there've been an error during saving). uploadPath will give us public/uploads/bookcovers and we wanna combine fileName at the end of the path.So it's gonna get rid of any file that has fileName iside bookCovers folder
}
async function renderNewPage(res, book, hasError = false){//hasError has default value. Sometimes we render a newBook sometimes we render an existing book
  try{
    //since we are passing authors to this page first we shoul get all authors
    const authors = await Author.find({})
    //we create a new Book if the user modify it
    // const book = new Book()
    const params = {
      authors: authors,
      book: book
    }
    if(hasError) params.errorMessage = 'Error Creating Book'
    res.render('books/new', params)
  } catch {
    res.redirect('/books')
  }
}
module.exports = router
