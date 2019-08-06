const { PastAppointments } = require("../../models/past_appointment");
const express = require("express");
const router = express.Router();
const { User } = require("../../models/user");

router.post("/", async(req, res) => {
    let phone_no = req.body.phone_no;

    let user = await User.findOne({ where: { phone_no: phone_no } });
    if (!user) res.status(400).send(`Phone Number: ${phone_no} is not registered in the system`);

    let appointments = await PastAppointments.findAll({
        where: {
            user_phone_no: phone_no
        }
    });

    if (!appointments) res.status(400).send(`You do not have any today's appointments`);

    let result = {};
    result.result = appointments;
    res.status(200).send(result);


});

module.exports = router;