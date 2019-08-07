const express = require("express");
const router = express.Router();
router.get("/", async (req, res) => {
  let obj = {
    name: "test",
    num: "-1",
    home: "home",
    schooL: "-1",
    love: "no"
  };
  let new_key_array = new Array();

  const value_array = Object.values(obj);
  const key_array = Object.keys(obj);

  for (let i = 0; i < value_array.length; i++) {
    if (value_array[i] == "-1") {
      new_key_array.push(key_array[i]);
    }
  }

  for (let j = 0; j < new_key_array.length; j++) {
    delete obj[new_key_array[j]];
  }
  res.status(200).send(obj);
});

module.exports = router;
