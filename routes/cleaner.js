const express = require("express");
const router = express.Router();
const { Appointment } = require("../models/appointment");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

router.get("/", async (req, res) => {
  let apps = await Appointment.findAll({
    raw: true,
    where: {
      appntmnt_date: {
        [Op.lte]: moment()
          .subtract(31, "days")
          .toDate()
      }
    }
  });

  for (var i = 0; i < apps.length; i++) {
    let client_id = apps[i].client_id;
    let next_app = await Appointment.findOne({
      raw: true,
      where: {
        client_id: client_id,
        id: {
          [Op.gt]: apps[i].id
        }
      },
      order: [["id", "ASC"]]
    });

    if (next_app) {
      let this_app_date = moment(apps[i].appntmnt_date);
      let next_app_created = moment(next_app.createdAt);
      let days_diff = this_app_date.diff(next_app_created, "days");

      if (days_diff > 30) {
        if (apps[i].app_status != "LTFU") {
          Appointment.update(
            {
              app_status: "LTFU"
            },
            {
              where: {
                id: apps[i].id
              }
            }
          );
        }
      } else if (days_diff > 5 && days_diff <= 30) {
        if (apps[i].app_status != "Defaulted") {
          Appointment.update(
            {
              app_status: "Defaulted"
            },
            {
              where: {
                id: apps[i].id
              }
            }
          );
        }
      } else if (days_diff > 0 && days_diff <= 4) {
        if (apps[i].app_status != "Missed") {
          Appointment.update(
            {
              app_status: "Missed"
            },
            {
              where: {
                id: apps[i].id
              }
            }
          );
        }
      } else {
        if (apps[i].app_status != "Notified") {
          Appointment.update(
            {
              app_status: "Notified"
            },
            {
              where: {
                id: apps[i].id
              }
            }
          );
        }
      }
    }

    // res
    //   .status(200)
    //   .send(`Client ID: ${client_id} | DIFF IN DAYS: ${days_diff}`);
  }
});

module.exports = router;
