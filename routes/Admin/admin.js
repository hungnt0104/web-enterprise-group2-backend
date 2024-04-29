var express = require('express');
var router = express.Router();
const UserModel = require('../../models/Admin/UserModel')
const EventModel = require('../../models/Admin/EventModel')
const FacultyModel = require('../../models/Admin/DepartmentModel');
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
    let{name, email, password, role, department} = req.body
  
    const encryptedPassword = await bcrypt.hash(password, 10) 

    try {
        const oldUser = await UserModel.findOne({email})
        if(oldUser){
          return res.json({ error : "Email Exists"})
        }
        if (role == "Admin" || role == "Manager"){
            console.log(role)
            department = "null"
        }
        await UserModel.create({
          name,
          email,
          password: encryptedPassword, 
          role,
          department
        })
        res.send({status: "ok"})
      } catch (error) {
        res.send({status: "error"})
      }
    });

router.put('/updateAccount/:id', async (req, res) => {
  let { name,  password, role, department } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10)
  try {
        if (role == "Admin" || role == "Manager"){
            department = "null"
        }
      const user = await UserModel.findByIdAndUpdate(req.params.id, {
          name,
          password : encryptedPassword,
          role, 
          department
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

// router.get('/currentEvent', (req, res) => {
//     EventModel.find({}, (err, events) => {
//         if (err) {
//             res.status(500).send(err.message);
//         } else {
//             if (events.length > 0) {
//                 const finalEvent = events[events.length - 1]; // Get the last event in the array
//                 console.log(finalEvent)
//                 res.status(200).json(finalEvent);
//             } else {
//                 res.status(404).send('No events found');
//             }
//         }
//     });
// });

router.get('/currentEvent', (req, res) => {
    EventModel.find({}, (err, events) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (events.length > 0) {
                let nearestEvent = null;
                let nearestDifference = Infinity; // Initialize with Infinity to ensure any first event will be closer
                const currentDate = new Date();
                
                events.forEach(event => {
                    const startDate = new Date(event.startDate);
                    let difference = Math.ceil((startDate - currentDate) / (1000 * 60 * 60 * 24)); // Calculate difference in days
                    // console.log(-difference)
                    difference = -difference
                    // Adjusted the condition to ensure only past or present events are considered
                    if (difference >= 0 && (difference < nearestDifference)) {
                        // console.log(difference)
                        nearestDifference = difference;
                        nearestEvent = event;
                        
                    }
                });
                // console.log(nearestDifference)

                // If nearestEvent is still null, it means there are no past or present events
                if (nearestEvent !== null) {
                    res.status(200).json(nearestEvent);
                } else {
                    res.status(404).send('No past or present events found');
                }
            } else {
                res.status(404).send('No events found');
            }
        }
    });
});

router.get('/getEvent/:id', async (req, res) => {
    try {
      const event = await EventModel.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Function to create an event
router.post('/createEvent', (req, res) => {
  const { name, description, status, department, startDate, firstDeadline } = req.body;
  
  const finalClosureDate = new Date(firstDeadline);
  finalClosureDate.setDate(finalClosureDate.getDate() + 14);

  const newEvent = new EventModel({ name, description, status, department, startDate, closureDates: { firstDeadline, finalClosureDate } });
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
  const { name, description, status, department, startDate, firstDeadline } = req.body;
    console.log(name, description, status, department, startDate, firstDeadline)
  const finalClosureDate = new Date(firstDeadline);
  finalClosureDate.setDate(finalClosureDate.getDate() + 14);

  EventModel.findByIdAndUpdate(eventId, { name, description, status, startDate, closureDates: { firstDeadline, finalClosureDate } }, { new: true }, (err, event) => {
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
    var facultyData = {
        name: req.body.name 
    };

    FacultyModel.create(facultyData, function(err, faculty) {
        if (err) {
            console.error("Error creating faculty:", err);
            return res.status(500).json({ error: 'Error creating faculty' }); 
        }
        res.status(201).json(faculty); 
    });
});




module.exports = router;