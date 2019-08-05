const express = require("express");
const app = express();
require("express-async-errors");
require("dotenv").config();

const users = require("./routes/users");
const clients = require("./routes/clients");
const app_diary = require("./routes/appointment_diary");
const verify = require("./routes/processes/verify_mflcode");

app.use(express.json());
app.use("/users", users);
app.use("/clients", clients);
app.use("/receiver", app_diary);
app.use("/verifyMFLCode", verify);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Ushauri Web App started. Listening on Port: ${PORT}`)
);