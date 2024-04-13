// models/article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    type: String // Array of filenames for images
  }],
  pdfs: [{
    type: String // Array of filenames for PDFs
  }],
  docs: [{
    type: String // Array of filenames for documents
  }],
      name: {
        type: String
    },
    email: {
        type: String
    },
    department: {
      type: String
  },
  isSelected: {
    type: Boolean, // Date of the comment
    default: false
},
date:{
  type: Date, // Date of the comment
  default: Date.now
},
  comments: [{
    text: {
        type: String
    },
    author: {
        type: String
    },
    date: {
        type: Date, // Date of the comment
        default: Date.now
    }
}]
});

module.exports = mongoose.model('Article', articleSchema);


