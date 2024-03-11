var express = require('express');
var router = express.Router();
const UserModel = require('../models/UserModel')
const EventModel = require('../models/EventModel')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const JWT_SECRET = "group2"

//FOR ACCOUNT
//Show All Account
router.get('/', async(req, res)=>{
    const data = await UserModel.find({})
    res.json({success : true, data:data})
   })
//Create Account
router.post('/createAccount', async(req, res) =>{
    const{name, email, password, role} = req.body
  
    const encryptedPassword = await bcrypt.hash(password, 10) //10: do dai cua hash

    try {
        const oldUser = await UserModel.findOne({email})
        if(oldUser){
          return res.json({ error : "Email Exists"})
        }
        await UserModel.create({
          name,
          email,
          password: encryptedPassword, //save encrypted password vao db
          role
        })
        res.send({status: "ok"})
      } catch (error) {
        res.send({status: "error"})
      }
    });
// Update Account
router.put('/updateAccount/:id', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
      const user = await UserModel.findByIdAndUpdate(req.params.id, {
          name,
          password,
          role
      }, { new: true });

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, message: "User updated successfully", data: user });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
// Delete Account
router.delete('/deleteAccount/:id', async (req, res) => {
  try {
      const user = await UserModel.findByIdAndDelete(req.params.id);

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, message: "User deleted successfully", data: user });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


//FOR EVENTS
// Function to get all events
router.get('/events', (req, res) => {
    EventModel.find({}, (err, events) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(events);
        }
    });
});

// Function to create an event
router.post('/createEvent', (req, res) => {
  const { eventName, firstClosureDate } = req.body;
  
  // Calculate the final closure date (7 days after the first closure date)
  const finalClosureDate = new Date(firstClosureDate);
  finalClosureDate.setDate(finalClosureDate.getDate() + 7);

  const newEvent = new EventModel({ eventName, closureDates: { firstClosureDate, finalClosureDate } });
  newEvent.save((err, event) => {
      if (err) {
          res.status(500).send(err.message);
      } else {
          res.status(201).json(event);
      }
  });
});


// Function to update an event
router.put('/updateEvent/:eventId', (req, res) => {
  const { eventId } = req.params;
  const { eventName, closureDates } = req.body;

  EventModel.findByIdAndUpdate(eventId, { eventName, closureDates }, { new: true }, (err, event) => {
      if (err) {
          res.status(500).send(err.message);
      } else if (!event) {
          res.status(404).send('Event not found');
      } else {
          res.status(200).json(event);
      }
  });
});

// Function to delete an event
router.delete('/deleteEvent/:eventId', (req, res) => {
  const { eventId } = req.params;

  EventModel.findByIdAndDelete(eventId, (err, event) => {
      if (err) {
          res.status(500).send(err.message);
      } else if (!event) {
          res.status(404).send('Event not found');
      } else {
          res.status(200).send('Event deleted successfully');
      }
  });
});


module.exports = router;