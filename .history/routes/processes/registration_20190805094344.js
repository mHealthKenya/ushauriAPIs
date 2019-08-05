const { Client } = require("../../models/client");
const moment = require("moment");
const base64 = require("base64util");
const { Sender } = require("../models/africastalking");
const { Message } = require("../models/message");

async function registerClient(message, user) {
    message = message.split("*");
    message = message[1];

    message = message.split("#");

    let decoded_message = await base64.decode(message[0]);

    // check if it is a valid base 64 encode
    if (!(base64.encode(decoded_message) === message[0]))
        return {
            code: 400,
            message: "Your application needs to be updated to use this feature"
        };

    decoded_message = "Reg*" + decoded_message;

    const variables = decoded_message.split("*");

    if (variables.length != 23)
        return {
            code: 400,
            message: "Your application needs to be updated to use this feature"
        };

    const reg = variables[0]; //CODE = REG : REGISTRATION 1
    const upn = variables[1]; //UPN/CCC NO 2
    const serial_no = variables[2]; //SERIAL NO 3
    const f_name = variables[3]; //FIRST NAME 4
    const m_name = variables[4]; //MIDDLE NAME 5
    const l_name = variables[5]; //LAST NAME 6
    let dob = variables[6]; //DATE OF BIRTH 7
    const national_id = variables[7]; //NATIONAL ID OR PASSOPRT NO 8
    const gender = variables[8]; //GENDER 9
    const marital = variables[9]; //MARITAL STATUS 10
    const condition = variables[10]; //CONDITION 11
    let enrollment_date = variables[11]; //ENROLLMENT DATE 12
    let art_start_date = variables[12]; //ART START DATE 13
    const primary_phone_no = variables[13]; //PHONE NUMBER 14
    const alt_phone_no = variables[14]; //PHONE NUMBER 14
    const trtmnt_buddy_phone_no = variables[15]; //PHONE NUMBER 14
    const language = variables[16]; //LANGUAGE 16
    let sms_enable = variables[17]; //SMS ENABLE 15
    const motivation_enable = variables[18]; //MOTIVATIONAL ALERTS ENABLE 18
    const messaging_time = variables[19]; //MESSAGING TIME 17
    const client_status = variables[20]; //CLIENT STATUS 19
    const transaction_type = variables[21]; //TRANSACTION TYPE 20
    const grouping = variables[22]; //GROUPING

    const mfl_code = user.facility_id;
    const clinic_id = user.clinic_id;
    const partner_id = user.partner_id;
    const user_id = user.id;

    if (!upn) return { code: 400, message: "Clinic Number not provided" };
    if (!f_name) return { code: 400, message: "First Name not provided" };
    if (!l_name) return { code: 400, message: "Last Name not provided" };
    if (!dob) return { code: 400, message: "Date of Birth not provided" };
    if (Date.parse(dob) > Date.parse(enrollment_date))
        return {
            code: 400,
            message: "Date of Birth cannot be greater than enrollment date"
        };
    if (Date.parse(dob) > Date.parse(art_start_date))
        return {
            code: 400,
            message: "Date of Birth cannot be greater than Art Start date"
        };
    if (Date.parse(enrollment_date) > Date.parse(art_start_date))
        return {
            code: 400,
            message: "Enrollment Date cannot be greater than Art start date"
        };
    dob = moment(dob, "DD/MM/YYYY").format("YYYY-MM-DD");
    enrollment_date = moment(enrollment_date, "DD/MM/YYYY").format("YYYY-MM-DD");
    art_start_date = moment(art_start_date, "DD/MM/YYYY").format("YYYY-MM-DD");

    var b = moment(new Date());
    var diffDays = b.diff(dob, "days");
    let group_id;
    if (diffDays >= 3650 && diffDays <= 6935) {
        //Adolescent
        group_id = 2;
    } else if (diffDays >= 7300) {
        //Adult
        group_id = 1;
    } else {
        //Paeds
        group_id = 3;
    }
    let consented = moment(new Date()).format("YYYY-MM-DD");
    if (parseInt(sms_enable) == 1) {
        sms_enable = "Yes";
    } else if (parseInt(sms_enable) == 2) {
        sms_enable = "No";
    }
    let status;
    if (parseInt(client_status) == 1) {
        status = "Active";
    } else if (parseInt(client_status) == 2) {
        status = "Disabled";
    } else if (parseInt(client_status) == 3) {
        status = "Deceased";
    }

    if (transaction_type == 1 || transaction_type == 3) {
        //New Registration or Transfer IN for a client not existing in the system

        const client = await Client.findOne({ where: { clinic_number: upn } });
        if (client)
            return {
                code: 400,
                message: `Client: ${upn} already exists in the system`
            };

        //save the client details
        return Client.findOrCreate({
                where: { clinic_number: upn },
                defaults: {
                    mfl_code: mfl_code,
                    f_name: f_name,
                    m_name: m_name,
                    l_name: l_name,
                    dob: dob,
                    gender: gender,
                    marital: marital,
                    client_status: condition,
                    enrollment_date: enrollment_date,
                    group_id: group_id,
                    phone_no: primary_phone_no,
                    alt_phone_no: alt_phone_no,
                    buddy_phone_no: trtmnt_buddy_phone_no,
                    language_id: language,
                    smsenable: sms_enable,
                    consent_date: consented,
                    partner_id: partner_id,
                    status: status,
                    art_date: art_start_date,
                    created_at: b,
                    entry_point: "Mobile",
                    created_by: user_id,
                    client_type: "New",
                    txt_time: messaging_time,
                    motivational_enable: motivation_enable,
                    wellness_enable: motivation_enable,
                    national_id: national_id,
                    file_no: serial_no,
                    clinic_id: clinic_id
                }
            })
            .then(([client, created]) => {
                if (created) {

                    return {
                        code: 200,
                        message: `Client ${upn} was created successfully`
                    };
                } else {
                    return {
                        code: 400,
                        message: `Error. Client ${upn} could not be created`
                    };
                }
            })
            .catch(e => {
                return { code: 500, message: e.message };
            });
    } else if (transaction_type == 2) {
        //save the client details
        return Client.update({
                mfl_code: mfl_code,
                f_name: f_name,
                m_name: m_name,
                l_name: l_name,
                dob: dob,
                gender: gender,
                marital: marital,
                client_status: condition,
                enrollment_date: enrollment_date,
                group_id: group_id,
                phone_no: primary_phone_no,
                alt_phone_no: alt_phone_no,
                buddy_phone_no: trtmnt_buddy_phone_no,
                language_id: language,
                smsenable: sms_enable,
                partner_id: partner_id,
                status: client_status,
                art_date: art_start_date,
                created_at: b,
                entry_point: "MOB",
                created_by: user_id,
                client_type: "New",
                txt_time: messaging_time,
                motivational_enable: motivation_enable,
                wellness_enable: motivation_enable,
                national_id: national_id,
                file_no: serial_no,
                clinic_id: clinic_id
            }, { returning: true, where: { clinic_number: upn } })
            .then(([client, updated]) => {
                if (updated) {
                    return {
                        code: 200,
                        message: `Client ${upn} was updated successfully`
                    };
                } else {
                    return {
                        code: 200,
                        message: `Could not update client ${upn}`
                    };
                }
            })
            .catch(e => {
                return { code: 500, message: e.message };
            });
    } else {
        return {
            code: 400,
            message: "Not a valid transaction type"
        };
    }
}

module.exports = registerClient;