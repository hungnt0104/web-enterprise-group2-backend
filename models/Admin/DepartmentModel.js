var mongoose = require('mongoose')
var DepartmentSchema = mongoose.Schema(
 {
  name: String
 }
)

var DepartmentModel = mongoose.model("department", DepartmentSchema, "department")

module.exports = DepartmentModel