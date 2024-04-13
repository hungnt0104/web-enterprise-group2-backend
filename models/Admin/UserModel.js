var mongoose = require('mongoose')
var UserSchema = mongoose.Schema(
 {
  name: String,
  email: {type: String, unique: true},
  password: String,
<<<<<<< HEAD
  department: String,
  role: String
=======
  role: String,
  department: String
>>>>>>> 9840d61 (Change multiple files)
 }
)

var UserModel = mongoose.model("user", UserSchema, "user")

module.exports = UserModel