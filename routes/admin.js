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

module.exports = router;