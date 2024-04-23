var express = require('express');
var router = express.Router();
const UserModel = require('../../models/Admin/UserModel')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const JWT_SECRET = "group2"

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/login", async(req, res)=>{
  const{email, password} = req.body
  // console.log(req.body)
  const user = await UserModel.findOne({email})
  // console.log(user)
  if(!user){
    return res.json({error: "User not found"})
  }
  // console.log(email)
  if(await bcrypt.compare(password, user.password)){
    const token = jwt.sign({email:user.email, userId: user._id}, JWT_SECRET, {
            expiresIn: 3600 //second
    })

    if(res.status(201)){
      return res.json({status: "okee", data: { token, userId: user._id, role: user.role, email: email, name: user.name, department: user.department }})
    }
    else{
      return res.json({status:"error", error:"Invalid password"})
    }
  }
})


module.exports = router;
