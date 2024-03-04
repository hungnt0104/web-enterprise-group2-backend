// controllers/eventController.js
const Event = require("../../models/Admin/EventModel");

exports.createEvent = async (req, res) => {
  try {
    const { name, submissionClosureDate, finalClosureDate } = req.body;
    const event = new Event({ name, submissionClosureDate, finalClosureDate });
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

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, submissionClosureDate, finalClosureDate } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { name, submissionClosureDate, finalClosureDate },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};