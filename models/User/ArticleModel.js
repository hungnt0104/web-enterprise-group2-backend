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
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true
  // },
  images: [{
    type: String,
    required: true // Assuming URLs will be stored as strings
    
  }],
  // Add more article properties as needed
});

module.exports = mongoose.model('Article', articleSchema);


