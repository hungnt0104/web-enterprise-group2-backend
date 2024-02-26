var express = require('express');
var router = express.Router();
const UserModel = require('../models/UserModel')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const JWT_SECRET = "group2"

router.get('/', async(req, res)=>{
    const data = await UserModel.find({})
    res.json({success : true, data:data})
   })

// Create account
// router.post('/createAccount',  async(req, res)=>{
//     const data = new UserModel(req.body) //lay data tu req 
//     await data.save()
//     res.send({success: true, message: "Added successfullyyyyy", data: data})
//    })

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
          email,
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
module.exports = router;
