// models/Idea.js
const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  content: { type: String, required: true },
  submittedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Idea", ideaSchema);
