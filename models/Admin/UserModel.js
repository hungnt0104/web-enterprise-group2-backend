var mongoose = require('mongoose')
var UserSchema = mongoose.Schema(
 {
  name: String,
  email: {type: String, unique: true},
  password: String,
  role: String,
  department: String

 }
)

var UserModel = mongoose.model("user", UserSchema, "user")

module.exports = UserModel
