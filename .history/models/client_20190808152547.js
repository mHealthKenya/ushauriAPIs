const sequelize = require("../db_config");
const Sequelize = require("sequelize");
const Joi = require("joi");
const Client = sequelize.sequelize.define(
    "tbl_client", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        group_id: Sequelize.INTEGER,
        language_id: Sequelize.INTEGER,
        clinic_number: {
            type: Sequelize.NUMBER,
            unique: true,
            allowNull: false,
            len: 10
        },
        f_name: Sequelize.STRING,
        m_name: Sequelize.STRING,
        l_name: Sequelize.STRING,
        dob: Sequelize.DATEONLY,
        txt_frequency: Sequelize.NUMBER,
        txt_time: Sequelize.NUMBER,
        phone_no: Sequelize.STRING,
        alt_phone_no: Sequelize.STRING,
        alt_phone_no: Sequelize.STRING,
        buddy_phone_no: Sequelize.STRING,
        shared_no_name: Sequelize.STRING,
        mfl_code: {
            type: Sequelize.INTEGER,
            len: 5
        },
        status: Sequelize.ENUM("Active", "Disabled", "Deceased"),
        client_status: Sequelize.ENUM("Art", "Pre Art"),
        gender: Sequelize.NUMBER,
        marital: Sequelize.NUMBER,
        smsenable: Sequelize.ENUM("Yes", "No"),
        enrollment_date: Sequelize.DATEONLY,
        art_date: {
            type: Sequelize.DATEONLY,
            defaultValue: null,
            allowNull: true

        },
        wellness_enable: Sequelize.ENUM("Yes", "No"),
        motivational_enable: Sequelize.ENUM("Yes", "No"),
        client_type: Sequelize.ENUM("New", "Transfer"),
        consent_date: Sequelize.DATEONLY,
        physical_address: Sequelize.STRING,
        transfer_date: Sequelize.DATEONLY,
        entry_point: Sequelize.STRING,
        gods_number: Sequelize.STRING,
        death_date: Sequelize.DATEONLY,
        patient_source: Sequelize.STRING,
        sending_app: Sequelize.STRING,
        prev_clinic: Sequelize.STRING,
        ushauri_id: Sequelize.INTEGER,
        db_source: Sequelize.STRING,
        clinic_id: Sequelize.INTEGER,
        national_id: Sequelize.STRING,
        file_no: Sequelize.STRING,
        created_by: Sequelize.INTEGER,
        updated_by: Sequelize.INTEGER
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "tbl_client"
    }
);

function validateClient(client) {
    const schema = {
        group_id: Joi.number(),
        mfl_code: Joi.number()
            .min(5)
            .max(5),
        clinic_number: Joi.number()
            .min(10)
            .max(10),
        file_no: Joi.string(),
        gender: Joi.number().required(),
        marital: Joi.number().required(),
        client_status: Joi.string().required(),
        enrollment_date: Joi.date().required(),
        art_date: Joi.date().required(),
        enable_sms: Joi.string().required(),
        status: Joi.string().required(),
        f_name: Joi.string()
            .min(3)
            .max(10)
            .required(),
        m_name: Joi.string()
            .min(3)
            .max(10),
        l_name: Joi.string()
            .min(3)
            .max(10)
            .required(),
        dob: Joi.date().required(),
        phone_no: Joi.string()
            .max(10)
            .min(10),
        status: Joi.string().required(),
        clinic_id: Joi.number()
    };

    return Joi.validate(client, schema);
}
exports.Client = Client;
exports.validateClient = validateClient;