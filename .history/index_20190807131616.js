const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("express-async-errors");
require("dotenv").config();

// const users = require("./routes/users");
const clients = require("./routes/clients");
const app_diary = require("./routes/appointment_diary");
const verify = require("./routes/processes/verify_mflcode");
const todaysAppointments = require("./routes/processes/process_today_appointment");
const pastAppointments = require("./routes/processes/process_past_appointment");

// app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/clients", clients);
app.use("/receiver", app_diary);
app.use("/verifyMFLCode", verify);
app.use("/today_appointments", todaysAppointments);
app.use("/past_appointments", pastAppointments);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Ushauri Web App started. Listening on Port: ${PORT}`)
);