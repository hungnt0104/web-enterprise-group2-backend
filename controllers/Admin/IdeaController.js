// controllers/ideaController.js
const Idea = require("../../models/Admin/IdeaModel");
const nodemailer = require('nodemailer');

exports.submitIdea = async (req, res) => {
  try {
    const { eventId, image, document, submittedBy } = req.body;
    const idea = new Idea({ eventId, image, document, submittedBy });
    await idea.save();

    // Send email notification
    await sendEmailNotification();

    res.status(201).json(idea);
    // res.send({status: "ok"})
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

exports.getAllIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find();
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an idea
exports.updateIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventId, image, document, submittedBy } = req.body;
    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      { eventId, image, document, submittedBy },
      { new: true }
    );
    if (!updatedIdea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    res.json(updatedIdea);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an idea
exports.deleteIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedIdea = await Idea.findByIdAndDelete(id);
    if (!deletedIdea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    res.json({ message: "Idea deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};