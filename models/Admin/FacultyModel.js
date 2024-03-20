var mongoose = require('mongoose')
var FacultySchema = mongoose.Schema(
 {
  name: String
 }
)

var FacultyModel = mongoose.model("faculty", FacultySchema, "faculty")

module.exports = FacultyModel