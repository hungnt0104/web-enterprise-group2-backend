var mongoose = require('mongoose');

// Define Event schema
var eventSchema = new mongoose.Schema({
    name: String,
    description : String,
    status : String,
    department : String,
    startDate: Date,
    closureDates: {
        firstDeadline: Date,
        finalClosureDate: Date
    },

});

// Create Event model
var EventModel = mongoose.model('Event', eventSchema, "event");

module.exports =  EventModel