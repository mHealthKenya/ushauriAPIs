const { TodayAppointments } = require("../../models/todays_appointment");
const express = require("express");
const router = express.Router();
const base64 = require("base64util");

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
    let message = new Array();
    for (let i = 0; i < appointments.length; i++) {

        let facility_id = appointments[i].facility_id;
        let user_phone_no = appointments[i].user_phone_no;
        let mfl_code = appointments[i].facility_id;
        let user_id = appointments[i].id;
        let clinic_id = appointments[i].clinic_id;
        let appointment_id = appointments[i].appointment_id;
        let CCC = appointments[i].CCC;
        let client_name = appointments[i].client_name;
        let client_phone_no = appointments[i].client_phone_no;
        let appointment_type = appointments[i].appointment_type;
        let appointment_date = appointments[i].appntmnt_date;
        let file_no = appointments[i].file_no;
        let buddy_phone_no = appointments[i].buddy_phone_no;
        appointments[i].trmnt_buddy_phone_no = '';

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

        let outgoing_msg = CCC + "*" + client_name +
            "*" + client_phone_no +
            "*" + appointment_type +
            "*" + appointment_id +
            "*" + file_no +
            "*" + appointments[i].trmnt_buddy_phone_no +
            "*" + appointment_date;
        let encrypted_msg = "TOAPP*" + await base64.encode(outgoing_msg);
        message.push(encrypted_msg);

    }
    let result = {};
    result.result = message;
    res.status(200).send(result);


});

module.exports = router;