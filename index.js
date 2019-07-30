const express = require("express");
const app = express();
require("express-async-errors");
require("dotenv").config();

const users = require("./routes/users");
const clients = require("./routes/clients");

app.use(express.json());
app.use("/users", users);
app.use("/clients", clients);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Ushauri Web App started. Listening on Port: ${PORT}`)
);
