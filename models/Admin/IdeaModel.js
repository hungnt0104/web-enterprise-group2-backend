// models/Idea.js
const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  image: { type: String }, // Store image URL
  document: { type: String }, // Store document URL
  submittedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Idea", ideaSchema);
