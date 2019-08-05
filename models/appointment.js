const sequelize = require("../db_config");
const Sequelize = require("sequelize");
const Appointment = sequelize.sequelize.define(
  "tbl_appointment",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    client_id: Sequelize.INTEGER,
    appntmnt_date: Sequelize.DATEONLY,
    app_type_1: Sequelize.INTEGER,
    app_status: Sequelize.ENUM(
      "Booked",
      "Notified",
      "Missed",
      "Defaulted",
      "LTFU"
    ),
    app_msg: Sequelize.TEXT,
    status: Sequelize.STRING,
    sent_status: Sequelize.STRING,
    entry_point: Sequelize.STRING,
    active_app: Sequelize.INTEGER,
    appointment_kept: Sequelize.STRING,
    no_calls: Sequelize.INTEGER,
    no_msgs: Sequelize.INTEGER,
    home_visits: Sequelize.INTEGER,
    fnl_trcing_outocme: Sequelize.INTEGER,
    fnl_outcome_dte: Sequelize.DATE,
    other_trcing_outcome: Sequelize.STRING,
    visit_type: Sequelize.STRING,
    unscheduled_date: Sequelize.DATEONLY,
    tracer_name: Sequelize.STRING,
    date_attended: Sequelize.DATEONLY,
    created_by: Sequelize.INTEGER,
    updated_by: Sequelize.INTEGER
  },
  {
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    tableName: "tbl_appointment"
  }
);
exports.Appointment = Appointment;
