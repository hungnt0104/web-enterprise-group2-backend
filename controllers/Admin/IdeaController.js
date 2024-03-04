// controllers/ideaController.js
const Idea = require("../../models/Admin/IdeaModel");

exports.submitIdea = async (req, res) => {
  try {
    const { eventId, content, submittedBy } = req.body;
    const idea = new Idea({ eventId, content, submittedBy });
    await idea.save();
    res.status(201).json(idea);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find();
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
