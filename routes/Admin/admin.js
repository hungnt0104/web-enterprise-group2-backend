var express = require('express');
var router = express.Router();
const UserModel = require('../../models/Admin/UserModel')
const EventModel = require('../../models/Admin/EventModel')
const FacultyModel = require('../../models/Admin/FacultyModel');
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
    const{name, email, password, role, department} = req.body
  
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
          role,
          department
        })
        res.send({status: "ok"})
      } catch (error) {
        res.send({status: "error"})
      }
    });
// Update Account
router.put('/updateAccount/:id', async (req, res) => {
  const { name,  password, role } = req.body;

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
  const { name, description, status, department, firstDeadline } = req.body;
  
  // Calculate the final closure date (7 days after the first closure date)
  const finalClosureDate = new Date(firstDeadline);
  finalClosureDate.setDate(finalClosureDate.getDate() + 7);

//   console.log(firstDeadline,finalClosureDate)
//   console.log(req.body)
//   finalClosureDate.setDate(finalClosureDate.getDate());

  const newEvent = new EventModel({ name, description, status, department, closureDates: { firstDeadline, finalClosureDate } });
  newEvent.save((err, event) => {
      if (err) {
          res.status(500).send(err.message);
      } else {
          res.send({status: "ok"})
      }
  });
});


// Function to update an event
router.put('/updateEvent/:eventId', (req, res) => {
  const { eventId } = req.params;
  const { eventName,description, status, faculty, closureDates } = req.body;

  EventModel.findByIdAndUpdate(eventId, { eventName,description, status, faculty, closureDates }, { new: true }, (err, event) => {
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

//Faculty
//Show All Faculty
router.get('/faculty', async(req, res)=>{
    const data = await FacultyModel.find({})
    res.json({success : true, data:data})
   })

router.post('/createFaculty', function(req, res) {
    // Extract data from the request body
    var facultyData = {
        name: req.body.name 
    };

    // Create a new faculty document using Mongoose
    FacultyModel.create(facultyData, function(err, faculty) {
        if (err) {
            console.error("Error creating faculty:", err);
            return res.status(500).json({ error: 'Error creating faculty' }); 
        }
        // Faculty created successfully
        res.status(201).json(faculty); // Send the created faculty document back to the client
    });
});




module.exports = router;