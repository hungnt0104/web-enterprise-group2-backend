// routes/article.js
const express = require('express');
const router = express.Router();
const Article = require('../../models/User/ArticleModel');
const nodemailer = require('nodemailer');
const multer = require('multer');
var path = require('path');


// Get all articles
router.get('/getArticles', async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific article
router.get('getArticles/:id', getArticle, (req, res) => {
  res.json(res.article);
});


// Create a new article
const storage = multer.diskStorage({
  destination: (req, file, cb ) => {
    cb(null, 'public/Images')
  },
  filename:function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix+ file.originalname)
  }
})

const upload = multer({ storage:storage
})
router.post('/createArticle', upload.single("image"), async (req, res) => {

  const { title, content } = req.body;
  // Extract image filename from uploaded file
  const imageeName = req.file.filename;
  try {
    // Create a new article with provided details
    const article = await Article.create({
      title: title,
      content: content,
      images: imageeName // Store image filename in the article

    });
     // Send email notification
     await sendEmailNotification();
    res.status(201).json({ message: 'Article created successfully', article: article });
   
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  
});



// Function to send email notification
async function sendEmailNotification() {
  try {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      // Specify your email service and credentials here
      host: 'smtp.gmail.com',
      port: 587,
      secure:false,
      service: 'gmail',
      auth: {
        user: 'thanhtoetoe@gmail.com',
        pass: 'eifw xlis ipxg zwif'
      }
    });

    // Email message options
    let mailOptions = {
      from: 'thanhtoetoe@gmail.com',
      to: ['nguyenthanhhung.thcneu@gmail.com'],
      subject: 'New Idea Submission',
      text: `A new idea has been submitted`,
      html: '<a href="https://support.google.com/">The submission</a>'
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully.');
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}




// Update an article
router.patch('/updateArticle/:id', getArticle, async (req, res) => {
  if (req.body.title != null) {
    res.article.title = req.body.title;
  }
  if (req.body.content != null) {
    res.article.content = req.body.content;
  }
  try {
    const updatedArticle = await res.article.save();
    res.json(updatedArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an article
router.delete('/deleteArticle/:id', getArticle, async (req, res) => {
  try {
    await res.article.remove();
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get article by ID
async function getArticle(req, res, next) {
  let article;
  try {
    article = await Article.findById(req.params.id);
    if (article == null) {
      return res.status(404).json({ message: 'Cannot find article' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.article = article;
  next();
}

module.exports = router;
