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
  }]
});

module.exports = mongoose.model('Article', articleSchema);


