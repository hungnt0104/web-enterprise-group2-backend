const Message = require('../../models/User/MessageModel');


const SaveMessage = async (name, email, department, message, createdTime) => {
  try {
    // Create a new message document using Mongoose model
    const newMessage = new Message({
      name,
      email,
      department,
      message,
      createdTime // Assuming createdTime is the timestamp sent from the client
    });
    
    // Save the message document to the database
    const savedMessage = await newMessage.save();
    
    return savedMessage;
  } catch (error) {
    throw error;
  }
};



module.exports =  SaveMessage

