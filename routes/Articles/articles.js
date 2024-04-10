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
router.get('/getArticles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination folder based on file type
    if (file.fieldname === 'images') {
      cb(null, 'public/Images');
    } else if (file.fieldname === 'pdfs') {
      cb(null, 'public/PDFs');
    } else if (file.fieldname === 'docs') {
      cb(null, 'public/Docs');
    } else {
      cb(null, 'public/Other'); // You can add more cases if needed
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize multer upload instance
const upload = multer({ storage: storage });

router.post('/createArticle', upload.fields([
  { name: 'images', maxCount: 10 }, 
  { name: 'pdfs', maxCount: 10 },
  { name: 'docs', maxCount: 10 }
]), async (req, res) => {
  try {
    // Access form fields and files using req.body and req.files
    const { title, content } = req.body;
    const images = req.files['images']; // Array of image files
    const pdfs = req.files['pdfs']; // Array of pdf files
    const docs = req.files['docs']; // Array of document files

    // Create a new article object
    const article = new Article({
      title,
      content,
      images: images ? images.map(img => img.filename) : [],
      pdfs: pdfs ? pdfs.map(pdf => pdf.filename) : [],
      docs: docs ? docs.map(doc => doc.filename) : []
    });

    // Save the article to the database
    await article.save();

    // Respond with success message
    res.status(201).json({ message: 'Article created successfully' });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





// Function to send email notification
async function sendEmailNotification(id) {
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
    const html = '<a href="http://localhost:3001/articleDetail/' + id + '">The submission</a>';
    // Email message options
    let mailOptions = {
      from: 'thanhtoetoe@gmail.com',
      to: ['nguyenthanhhung.thcneu@gmail.com'],
      subject: 'New Idea Submission',
      text: `A new idea has been submitted`,
      html: html
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
