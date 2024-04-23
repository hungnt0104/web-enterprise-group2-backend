const Message = require('../../models/User/MessageModel');

const GetMessage = async (department) => {
  try {
    // Find messages by department from MongoDB
    const messages = await Message.find({ department }).sort({ createdTime: 1 }).exec();
    return messages;
  } catch (error) {
    console.error('Error fetching messages by department:', error);
    return [];
  }
}

module.exports = GetMessage;

