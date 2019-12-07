const express = require('express');
const router = express.Router();
const Author = require('../models/author');

//The routes or the controllers have single file. In views folder we have a folder with files  for a single route controller
//authors folder in the views folder contains all views for author route
//All Authors Route

router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {//we don't use here req.body because it's a get request sends information in query string (in url) ao name paramerer will be in a query string. The post request sends info through the body 
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const authors = await Author.find(searchOptions)
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})
//New Author Router. This route is for displaying the form where you can add an author
router.get('/new', (req, res) =>{//in the result it will be authors/new
  res.render('authors/new', {author: new Author()});//this doesn't save anything to the database but it give us an object that we can use in ejs file
});
//the route that create authors for us. We use post for creation. it just create and doen't render anything for us so we don't need ejs in views forlder for this
router.post('/', async (req, res) => {//asyncronise function
  const author = new Author({
    name: req.body.name
  })
  try {
    const newAuthor = await author.save() //if it waited until it was saved then
    res.redirect(`authors`)
  } catch {//if there is an error catch catches errors
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

module.exports = router;
