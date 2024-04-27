// routes/article.js
const express = require('express');
const router = express.Router();
const Article = require('../../models/User/ArticleModel');
const UserModel = require('../../models/Admin/UserModel');
const EventModel = require('../../models/Admin/EventModel');
const Faculty = require('../../models/Admin/DepartmentModel');
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
//Get selected articles
router.get('/getSelectedArticles', async (req, res) => {
  try {
    const articles = await Article.find({ isSelected: true });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//Get faculty articles
router.get('/getFacultyArticles/:id', async (req, res) => {
  try {
    const articles = await Article.find({ department: req.params.id });
    res.json(articles);
    // console.log(articles)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Get current selected articles
router.get('/getCurrentSelectedArticles/:id', async (req, res) => {
  try {
    // console.log(req.params.id)
    const articles = await Article.find({ isSelected: true, eventId: req.params.id });
    res.json(articles);
    // console.log(articles)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//Get my articles
router.get('/getMyArticle/:id', async (req, res) => {
  try {
    const articles = await Article.find({ email: req.params.id });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Statistics
router.get('/getStatistics', async (req, res) => {
  try {
    const articles = await Article.find();

    // Count the number of articles in each department
    const departmentCounts = await Article.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);
    
    const contributorsPerFaculty = await Article.aggregate([
      {
        $group: {
          _id: "$department", // Group by department
          authorsCount: { $addToSet: "$email" } // Add unique emails to set for each department
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          department: "$_id", // Rename _id to department
          numberOfAuthors: { $size: "$authorsCount" } // Calculate the size of the authorsCount array to get the number of authors
        }
      }
    ]);

    const articlesLength = articles.length;
    const faculties = await Faculty.find();
    const totalFaculties = faculties.length;
    const users = await UserModel.find();
    const totalUsers = users.length;

    const contributorsCount = await Article.aggregate([
      { $group: { _id: "$email" } },
      { $count: "totalContributors" }
    ]);
    const totalContributors = contributorsCount.length > 0 ? contributorsCount[0].totalContributors : 0;

    const articlesByMonth = await Article.aggregate([
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" } }, // Group by month and year
          count: { $sum: 1 }, // Count the number of articles
          contributors: { $addToSet: "$email" } // Collect unique contributors
        }
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year", // Project the year
          count: 1,
          contributors: { $size: "$contributors" } 
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    res.json({
      totalArticles: articlesLength,
      totalContributors: totalContributors,
      totalFaculties: totalFaculties,
      totalUsers: totalUsers,
      departmentCounts: departmentCounts,
      articlesByMonth: articlesByMonth,
      contributorsPerFaculty: contributorsPerFaculty
    });
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
      cb(null, 'public/Other'); 
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

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

    await article.save();
    const users = await UserModel.find({ department: department, role: "Coordinator" });
    for (const user of users) {
      await sendEmailNotification(article._id, user.email);
    }
    res.status(201).json({ message: 'Article created successfully' });
  } else {
    
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
    const html = '<a href="https://web-enterprise-group2-frontend-test2.onrender.com/' + id + '">The submission</a>';
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
router.put('/updateArticle/:id', upload.fields([
  { name: 'images', maxCount: 10 }, 
  { name: 'pdfs', maxCount: 10 },
  { name: 'docs', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, content, department, name, email, eventId } = req.body;
    const { id } = req.params;
    const now = new Date();
    
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    
    // const eventObject = await EventModel.findById(eventId);
    // if (!eventObject) {
    //   return res.status(500).json({ message: 'Event not found' });
    // } else if (eventObject.closureDates.firstDeadline <= now) {
    //   return res.status(500).json({ message: 'The deadline has passed' });
    // }

    console.log(req.files['images'])
    
    const images = req.files['images'];
    const pdfs = req.files['pdfs'];
    const docs = req.files['docs'];
    
    const updatedArticle = {
      title,
      content,
      department, 
      name, 
      email,
      eventId,
      date: now,
      images: images ? images.map(img => img.filename) : article.images,
      pdfs: pdfs ? pdfs.map(pdf => pdf.filename) : article.pdfs,
      docs: docs ? docs.map(doc => doc.filename) : article.docs
    };
    
    const updated = await Article.findByIdAndUpdate(id, updatedArticle, { new: true });
    
    res.status(200).json({ message: 'Article updated successfully', article: updated });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete article
router.delete('/deleteArticle/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    await Article.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Comment function
router.post('/commentArticle/:articleId', async (req, res) => {
  try {
      const { articleId } = req.params;
      const { comment, author, finalDeadline } = req.body;
      const now = new Date();
      const finalDeadlineDate = new Date(finalDeadline);

      // Find the article by its ID
      const article = await Article.findById(articleId);

      if (!article) {
          return res.status(404).json({ error: 'Article not found' });
      }

      if (now > finalDeadlineDate) {
        // If current time (now) is greater than the final deadline
        console.log("Final deadline was passed");
        return res.status(500).json({ error: 'Final deadline was passed' });
      } else {
        // If the final deadline has not passed
        console.log("Final deadline has not passed yet");
      }

      const newComment = {
        text: comment,
        author: author,
    };

      article.comments.push(newComment);
      sendCommentNotification(articleId, article.email, newComment);

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
    const html = '<p>' + newComment.text + '<p/><br/><a href="https://web-enterprise-group2-frontend-test2.onrender.com/' + id + '">Check now</a>';
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

    const article = await Article.findById(articleId);

    if (!article) {
        return res.status(404).json({ error: 'Article not found' });
    }
    article.isSelected = true;
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
    const article = await Article.findById(articleId);

    if (!article) {
        return res.status(404).json({ error: 'Article not found' });
    }
    article.isSelected = false;
    await article.save();
    res.status(200).json({ message: 'isSelected set to true successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
