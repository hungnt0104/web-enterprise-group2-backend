// routes/article.js
const express = require('express');
const router = express.Router();
const Article = require('../../models/User/ArticleModel');
const UserModel = require('../../models/Admin/UserModel');
const EventModel = require('../../models/Admin/EventModel');
const Faculty = require('../../models/Admin/FacultyModel');
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

//Statistics
router.get('/getStatistics', async (req, res) => {
  try {
    const articles = await Article.find();
    const articlesLength = articles.length;
    const faculties = await Faculty.find();
    const totalFaculties = faculties.length;
    const users = await UserModel.find();
    const totalUsers = faculties.length;

    // console.log(totalFaculties)

    const contributorsCount = await Article.aggregate([
      { $group: { _id: "$email" } },
      { $count: "totalContributors" }
    ]);
    // console.log(contributorsCount)
    const totalContributors = contributorsCount.length > 0 ? contributorsCount[0].totalContributors : 0;
    // console.log(totalContributors)

    res.json({totalArticles: articlesLength, totalContributors: totalContributors, totalFaculties: totalFaculties, totalUsers: totalUsers});
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
    const { title, content, department, name, email, eventId } = req.body;
    //Handle event and deadlines
    const eventObject = await EventModel.findById(eventId);

if (!eventObject) {
  res.status(500).json({ message: 'Event not found' });
} else {
  const now = new Date();
  // console.log(eventObject.closureDates.firstDeadline , now)
  if (eventObject.closureDates.firstDeadline > now) {
    // console.log(department)
    const images = req.files['images']; // Array of image files
    const pdfs = req.files['pdfs']; // Array of pdf files
    const docs = req.files['docs']; // Array of document files

    // Create a new article object
    const article = new Article({
      title,
      content,
      department, 
      name, 
      email,
      eventId,
      date: now,
      images: images ? images.map(img => img.filename) : [],
      pdfs: pdfs ? pdfs.map(pdf => pdf.filename) : [],
      docs: docs ? docs.map(doc => doc.filename) : []
    });

    // Save the article to the database
    await article.save();
    const users = await UserModel.find({ department: department, role: "Coordinator" });
    for (const user of users) {
      await sendEmailNotification(article._id, user.email);
    }
    // sendEmailNotification(id, department)
    // Respond with success message
    res.status(201).json({ message: 'Article created successfully' });
  } else {
    // Perform actions if the first deadline has passed
    // For example:
    // console.log('Deadline')
    res.status(500).json({ message: 'The deadline was passed' });
  }
}
    
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Function to send email notification
async function sendEmailNotification(id, email) {
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
      to: [email],
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

//Comment function
router.post('/commentArticle/:articleId', async (req, res) => {
  try {
      const { articleId } = req.params;
      const { comment, author } = req.body;
      // console.log(comment, author)

      // Find the article by its ID
      const article = await Article.findById(articleId);

      if (!article) {
          return res.status(404).json({ error: 'Article not found' });
      }
      const newComment = {
        text: comment,
        author: author,
        // date: Date.now
    };

      // Add the comment to the comments array
      article.comments.push(newComment);
      sendCommentNotification(articleId, article.email, newComment);

      // Save the updated article
      await article.save();

      res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to send email notification
async function sendCommentNotification(id, email, newComment) {
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
    const html = '<p>' + newComment.text + '<p/><br/><a href="http://localhost:3001/articleDetail/' + id + '">Check now</a>';
    // Email message options
    let mailOptions = {
      from: 'thanhtoetoe@gmail.com',
      to: [email],
      subject: 'New Comment to your post',
      text: `Your post received a new comment`,
      html: html
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully.');
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

router.post('/setIsSelected/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;

    // Find the article by its ID
    const article = await Article.findById(articleId);

    if (!article) {
        return res.status(404).json({ error: 'Article not found' });
    }

    // Update the isSelected property
    article.isSelected = true;

    // Save the updated article
    await article.save();

    res.status(200).json({ message: 'isSelected set to true successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/setIsSelectedToFalse/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;

    // Find the article by its ID
    const article = await Article.findById(articleId);

    if (!article) {
        return res.status(404).json({ error: 'Article not found' });
    }

    // Update the isSelected property
    article.isSelected = false;

    // Save the updated article
    await article.save();

    res.status(200).json({ message: 'isSelected set to true successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
