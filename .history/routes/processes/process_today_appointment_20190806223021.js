const { TodayAppointments } = require("../../models/todays_appointment");
const express = require("express");
const router = express.Router();
const { User } = require("../../models/user");

router.post("/", async(req, res) => {
    let phone_no = req.body.phone_no;

    let user = await User.findOne({ where: { phone_no: phone_no } });
    if (!user) res.status(400).send(`Phone Number: ${phone_no} is not registered in the system`);

    let appointments = await TodayAppointments.findAll({
        where: {
            user_phone_no: phone_no
        }
    });

    if (!appointments) res.status(400).send(`You do not have any today's appointments`);

    for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].buddy_phone_no == "") {
            appointments[i].trmnt_buddy_phone_no = '-1';
        } else {
            appointments[i].trmnt_buddy_phone_no = appointments[i].buddy_phone_no;
        }

        if (appointments[i].file_no == " ") {
            appointments[i].file_no = '-1';
        } else {
            appointments[i].file_no = appointments[i].file_no;
        }

        if (appointments[i].client_name == "") {
            appointments[i].client_name = '-1';
        } else {
            appointments[i].client_name = appointments[i].client_name;
        }

        if (appointments[i].client_phone_no == "") {
            appointments[i].client_phone_no = '-1';
        } else {
            appointments[i].client_phone_no = appointments[i].client_phone_no;
        }

        if (appointments[i].appointment_type == "") {
            appointments[i].appointment_type = '-1';
        } else {
            appointments[i].appointment_type = appointments[i].appointment_type;
        }


        if (appointments[i].appointment_id == "") {
            appointments[i].appointment_id = '-1';
        } else {
            appointments[i].appointment_id = appointments[i].appointment_id;
        }
        console, log(appointments[i])
    }

    let result = {};
    result.result = appointments;
    res.status(200).send(result);


});

module.exports = router;