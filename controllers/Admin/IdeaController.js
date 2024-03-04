// controllers/ideaController.js
const Idea = require("../../models/Admin/IdeaModel");

exports.submitIdea = async (req, res) => {
  try {
    const { eventId, image, document, submittedBy } = req.body;
    const idea = new Idea({ eventId, image, document, submittedBy });
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