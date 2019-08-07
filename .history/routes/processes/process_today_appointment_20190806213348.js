const { TodayAppointments } = require("../../models/todays_appointment");
const express = require("express");
const router = express.Router();

router.post("/", async(req, res) => {
    let phone_no = req.body.phone_no;

    let user = await user.findOne({ where: { phone_no: phone } });
    if (!user) res.status(400).send(`Phone Number: ${phone} is not registered in the system`);



})