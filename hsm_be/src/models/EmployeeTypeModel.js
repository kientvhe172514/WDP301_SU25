const mongoose = require("mongoose");

const employeeTypeSchema = new mongoose.Schema(
    {
        EmployeeType: { type: String, required: true },
    }
);

const EmployeeType = mongoose.model("employee_types", employeeTypeSchema);

module.exports = EmployeeType;
