const { User } = require("../models/user");
const express = require("express");
const router = express.Router();

Router.post("/", async(req, res) => {

    //validating first the request
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    const phone = req.body.phone_no;

    //check user phone number and mfl_code and clinic

    let user = await User.findOne({ where: { phone_no: phone, facility_id: facility, } })
})