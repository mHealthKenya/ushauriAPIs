const express = require("express");
const router = express.Router();
const { Sender } = require("../../models/mpunda_africastalking");

router.post("/", async (req, res) => {
  let phone = req.body.phone;
  let msg = req.body.message;
  let sender = await Sender(phone, msg);
  res.send(sender);
});

module.exports = router;
