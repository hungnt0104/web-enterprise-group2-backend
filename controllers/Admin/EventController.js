// controllers/eventController.js
const Event = require("../../models/Admin/EventModel");

exports.createEvent = async (req, res) => {
  try {
    const { name, closureDate } = req.body;
    const event = new Event({ name, closureDate });
    await event.save();
    res.status(201).json(event);
    console.log(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
