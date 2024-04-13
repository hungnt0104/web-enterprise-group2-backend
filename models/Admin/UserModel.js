var mongoose = require('mongoose')
var UserSchema = mongoose.Schema(
 {
  name: String,
  email: {type: String, unique: true},
  password: String,
  department: String,
  role: String
 }
)

var UserModel = mongoose.model("user", UserSchema, "user")

module.exports = UserModel