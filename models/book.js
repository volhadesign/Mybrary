const mongoose = require('mongoose');
const path = require('path');
const coverImageBasePath = 'uploads/bookCovers';//it will be in public folder
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  publishDate: {
    type: Date,
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  coverImageName: {
    type: String,//here we passing not image itself but a string (a name of the image) so that we store just this string but images we can store on the server in a file system
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,//this is referencing another object inside our collections
    required: true,
    ref: 'Author'//here we are referencing the Author collection (Author model)

  }

});

bookSchema.virtual('coverImagePath').get(function() {
  if(this.coverImageName != null) {
    return path.join('/', coverImageBasePath, this.coverImageName)
  }
})// it allows us to create virtual property. it acts as usual variables above but it derives its value from these variables. When we call  book.coverImagePath its going to call the get function. In function we define how we gonna get it. We don't use arrow function because we need to have access to this (means actual book)

module.exports = mongoose.model('Book', bookSchema);
module.exports.coverImageBasePath = coverImageBasePath;// we want to export it not as default but  as a named variable then we import this into books route
