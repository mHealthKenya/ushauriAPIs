const { User } = require("../models/user");
const { Incoming } = require("../models/incoming");
const { Sender } = require("../models/africastalking");
const express = require("express");
const router = express.Router();
const registerClient = require("./processes/registration");
const consentClient = require("./processes/consent");
const processAppointment = require("./processes/process_appointment");
const clearFakeMissed = require("./processes/clear_fake_missed");

router.post("/", async (req, res) => {
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
  }
});

router.get("/:id", async (req, res) => {
  const incoming_id = req.params.id;

  let incoming = await Incoming.findByPk(incoming_id);
  if (!incoming)
    res.status(400).send(`Incoming ID: ${incoming_id} not in the system`);

  if (incoming.processed == "No") {
    let message = incoming.msg;
    message = message.split("#");
    const phone = incoming.source;
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
      } else if (message.includes("FAKE")) {
        res.send("IN fake clearance sms");
      }
    }

    Incoming.update(
      {
        processed: "Yes"
      },
      { returning: true, where: { id: incoming_id } }
    )
      .then(([client, updated]) => {})
      .catch(e => {});
  }
  res.send(true);
});

module.exports = router;
