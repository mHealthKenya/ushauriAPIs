const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const TodayAppointments = sequelize.sequelize.define(
    "todays_appointments", {
        appointment_id: Sequelize.INTEGER,
        clinic_id: Sequelize.INTEGER,
        ccc: Sequelize.INTEGER,
        client_name: Sequelize.STRING,
        appointment_kept: Sequelize.STRING,
        client_phone_no: Sequelize.STRING,
        appointment_type: Sequelize.STRING,
        appntmnt_date: Sequelize.STRING,
        file_no: Sequelize.INTEGER,
        buddy_phone_no: Sequelize.STRING,
        facility_id: Sequelize.INTEGER,
        user_phone_no: Sequelize.STRING,
        id: Sequelize.INTEGER,
        created_at: Sequelize.STRING

    }, {
        freezeTableName: true,
        tableName: "todays_appointments"
    }
);
exports.TodayAppointments = TodayAppointments;