const mongoose = require('mongoose');

// Define the schema for the messages
const messageSchema = new mongoose.Schema({
  
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  message: { type: String, required: true },
  createdTime: { type: Date, default: Date.now }
});

// Create the Mongoose model based on the schema
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
