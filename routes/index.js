const express = require('express');
const router = express.Router();
const Book = require('../models/book');

router.get('/', async (req, res) => {
  let books;
  try {
    books = await Book.find().sort({createdAt: 'desc'}).limit(10).exec();//it's gonna to find all the books in our database, sort them by createdAt, it's gonna give us the first 10 results

  } catch {
    books = [];

  }

  res.render('index', {books: books});
})

module.exports = router;
