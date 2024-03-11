var mongoose = require('mongoose');

// Define Event schema
var eventSchema = new mongoose.Schema({
    eventName: String,
    closureDates: {
        firstClosureDate: Date,
        finalClosureDate: Date
    }
});

// Create Event model
var EventModel = mongoose.model('Event', eventSchema, "event");

module.exports =  EventModel