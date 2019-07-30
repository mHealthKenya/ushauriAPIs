const { validateClient, Client } = require("../models/client");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const base64 = require("base64util");

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
    message = message.split("*");
    message = message[1];

    message = message.split("#");

    let decoded_message = await base64.decode(message[0]);

    // check if it is a valid base 64 encode
    if (!(base64.encode(decoded_message) === message[0]))
      res
        .status(400)
        .send("Your application needs to be updated to use this feature");

    decoded_message = "Reg*" + decoded_message;

    const variables = decoded_message.split("*");

    if (variables.length != 23)
      res
        .status(400)
        .send("Your application needs to be updated to use this feature");

    const reg = variables[0]; //CODE = REG => REGISTRATION 1
    const upn = variables[1]; //UPN/CCC NO 2
    const serial_no = variables[2]; //SERIAL NO 3
    const f_name = variables[3]; //FIRST NAME 4
    const m_name = variables[4]; //MIDDLE NAME 5
    const l_name = variables[5]; //LAST NAME 6
    const dob = variables[6]; //DATE OF BIRTH 7
    const national_id = variables[7]; //NATIONAL ID OR PASSOPRT NO 8
    const gender = variables[8]; //GENDER 9
    const marital = variables[9]; //MARITAL STATUS 10
    const condition = variables[10]; //CONDITION 11
    const enrollment_date = variables[11]; //ENROLLMENT DATE 12
    const art_start_date = variables[12]; //ART START DATE 13
    const primary_phone_no = variables[13]; //PHONE NUMBER 14
    const alt_phone_no = variables[14]; //PHONE NUMBER 14
    const trtmnt_buddy_phone_no = variables[15]; //PHONE NUMBER 14
    const language = variables[16]; //LANGUAGE 16
    const sms_enable = variables[17]; //SMS ENABLE 15
    const motivation_enable = variables[18]; //MOTIVATIONAL ALERTS ENABLE 18
    const messaging_time = variables[19]; //MESSAGING TIME 17
    const client_status = variables[20]; //CLIENT STATUS 19
    const transaction_type = variables[21]; //TRANSACTION TYPE 20
    const grouping = variables[22]; //GROUPING

    const mfl_code = user.facility_id;

    res.send(`${mfl_code}`);
  } else {
    //if not exit
    res.send("It is not a registration message");
  }
});

module.exports = router;
