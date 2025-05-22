const mongoose = require("mongoose");

const employeeScheduleSchema = new mongoose.Schema(
    {
        employees: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees",
            required: true
        },
        hotels: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "hotels",
            required: true
        },
        employee_types: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employee_types",
            required: true
        },

        schedule: [
            {
                date: {
                    type: String,
                    required: true
                },
                start_time: {
                    type: String,
                    required: true
                },
                end_time: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const EmployeeSchedule = mongoose.model("employee_schedules", employeeScheduleSchema);

module.exports = EmployeeSchedule;
