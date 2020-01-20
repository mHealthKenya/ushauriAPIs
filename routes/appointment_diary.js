const { User } = require("../models/user");
const { Incoming } = require("../models/incoming");
const { Sender } = require("../models/africastalking");
const express = require("express");
const router = express.Router();
const registerClient = require("./processes/registration");
const consentClient = require("./processes/consent");
const processAppointment = require("./processes/process_appointment");
const clearFakeMissed = require("./processes/clear_fake_missed");
const processDefaulterDiary = require("./processes/process_defaulter_diary");
const moveClient = require("./processes/clinic_movement");
const transferClient = require("./processes/transer_client");
const transitClient = require("./processes/transit_client");
const getTodaysAppoitnmentSMS = require("./processes/get_todays_appointments_sms");
const getPastAppoitnmentSMS = require("./processes/get_past_appointments_sms");

router.post("/", async(req, res) => {
    let message = req.body.msg;
    const phone = req.body.phone_no;
    //check if user exists

    let user = await User.findOne({ where: { phone_no: phone } });
    if (!user)
        res
        .status(400)
        .send(`Phone Number: ${phone} is not registered in the system`);

    //check if message if registration message

    if (message.includes("Reg")) {
        let result = await registerClient(message, user);
        res.status(`${result.code}`).send(`${result.message}`);
    } else if (message.includes("CON")) {
        let result = await consentClient(message, user);
        res.status(`${result.code}`).send(`${result.message}`);
    } else if (message.includes("APP")) {
        let result = await processAppointment(message, user);
        res.status(`${result.code}`).send(`${result.message}`);
    } else if (message.includes("FAKE")) {
        let result = await clearFakeMissed(message, user);
        res.status(`${result.code}`).send(`${result.message}`);
    } else if (message.includes("MOVECLINIC")) {
        let result = await moveClient(message, user);
        res.status(`${result.code}`).send(`${result.message}`);
    } else if (message.includes("TRANS")) {
        let result = await transferClient(message, user);
        res.status(`${result.code}`).send(`${result.message}`);
    } else if (
        message.includes("MSD") ||
        message.includes("DF") ||
        message.includes("LTFU")
    ) {
        let result = await processDefaulterDiary(message, user);
        res.status(`${result.code}`).send(`${result.message}`);
    } else if (message.includes("TRANSITCLIENT")) {
        let result = await transitClient(message, user);
        res.status(`${result.code}`).send(`${result.message}`);
    }
});

router.get("/:id", async(req, res) => {
    const incoming_id = req.params.id;

    let incoming = await Incoming.findByPk(incoming_id);

    if (!incoming)
        res.status(400).send(`Incoming ID: ${incoming_id} not in the system`);

    if (incoming.processed == "Not Processed") {
        let message = incoming.msg;
        message = message.split("#");
        let phone = incoming.source;

        phone = phone.substring(4);
        phone = "0" + phone;

        console.log(phone);
        message = message[0];

        let user = await User.findOne({ where: { phone_no: phone } });
        if (!user) {
            msg = `Phone Number: ${phone} is not registered in the system`;
            let sender = await Sender(phone, msg);
            res.send(sender);
        } else {
            if (message.includes("Reg")) {
                let result = await registerClient(message, user);
                Sender(phone, `${result.message}`);
            } else if (message.includes("CON")) {
                let result = await consentClient(message, user);
                Sender(phone, `${result.message}`);
            } else if (message.includes("APP")) {
                let result = await processAppointment(message, user);
                Sender(phone, `${result.message}`);
            } else if (message.includes("MOVECLINIC")) {
                let result = await moveClient(message, user);
                Sender(phone, `${result.message}`);
            } else if (
                message.includes("MSD") ||
                message.includes("DF") ||
                message.includes("LTFU")
            ) {
                let result = await processDefaulterDiary(message, user);
                Sender(phone, `${result.message}`);
            } else if (message.includes("TRANSITCLIENT")) {
                let result = await transitClient(message, user);
                Sender(phone, `${result.message}`);
            } else if (!isNaN(message)) {
                let result = await getTodaysAppoitnmentSMS(message);
                if (Array.isArray(result)) {
                    for (let i = 0; i < result.length; i++) {
                        let msg = "<# " + result[i] + "afS/RY5iPcB>";
                        // console.log(`todays: ${msg}`);
                        Sender(phone, msg);
                    }
                    Sender(phone, result);
                }
                let pastresult = await getPastAppoitnmentSMS(message);

                if (Array.isArray(pastresult)) {
                    for (let i = 0; i < pastresult.length; i++) {
                        let msg = "<# " + pastresult[i] + "afS/RY5iPcB>";
                        // console.log(`past: ${msg}`);
                        Sender(phone, msg);
                    }
                }
                Sender(phone, pastresult);
            }
        }

        Incoming.update({
                processed: "Processed"
            }, { returning: true, where: { id: incoming_id } })
            .then(([client, updated]) => {})
            .catch(e => {});
    }
    res.send(true);
});

module.exports = router;