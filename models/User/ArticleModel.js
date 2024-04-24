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
    type: String 
  }],
  pdfs: [{
    type: String 
  }],
  docs: [{
    type: String 
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
    type: Boolean, 
    default: false
},
date:{
  type: Date
},
eventId:{
  type: String
},
  comments: [{
    text: {
        type: String
    },
    author: {
        type: String
    },
    date: {
        type: Date, 
        default: Date.now
    }
}]
});

module.exports = mongoose.model('Article', articleSchema);


