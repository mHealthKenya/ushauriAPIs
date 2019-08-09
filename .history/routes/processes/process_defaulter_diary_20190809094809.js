const { Client } = require("../../models/client");
const moment = require("moment");
const base64 = require("base64util");
const { Appointment } = require("../../models/appointment");
const { clientOutcome } = require("../../models/client_outcome");
const {
    OtherAppointmentType
} = require("../../models/other_appointment_types");
const { OtherFinalOutcome } = require("../../models/other_final_outcome");

async function processDefaulterDiary(message, user) {
    message = message.split("*");
    message = message[1];

    message = message.split("#");

    let decoded_message = await base64.decode(message[0].trim());

    //IF SOMETHING HAPPENS PLEASE UNCOMMENT AND DEBUG


    // check if it is a valid base 64 encode
    // if (!(base64.encode(decoded_message).trim() === message[0].trim()))
    // return {
    //     code: 400,
    //     message: "Your application needs to be updated to use this feature1"
    // };


    decoded_message = "MSDC*" + decoded_message;

    const variables = decoded_message.split("*");

    if (variables.length != 14)
        return {
            code: 400,
            message: "Your application needs to be updated to use this feature"
        };

    let clinic_number = variables[1];
    let old_appointment_type = variables[2];
    let new_appointment_type = variables[3];
    let appointment_other = variables[4];
    let call_date = variables[5];
    let outcome = variables[6];
    let app_date = variables[7];
    let tracer_name = variables[8];
    let final_outcome = variables[9];
    let other_outcome = variables[10];
    let appointment_id = variables[11];
    let return_date = variables[12];
    let tracing_cost = variables[13];
    let final_outcome1;
    let today = moment(new Date());

    if (outcome == "4") {
        final_outcome1 = "";
    }
    if (outcome == "1") {
        if (final_outcome == "7" || final_outcome == "8" || final_outcome == "9") {
            final_outcome = final_outcome + 1;
        }
    }

    if (outcome == "1" || outcome == "2") {
        if (final_outcome == "4") {
            final_outcome = "5";
        }
    }
    if (final_outcome == "1") {
        final_outcome1 = "3";
    }
    if (final_outcome == "2") {
        final_outcome1 = "5";
    }
    if (final_outcome == "3") {
        final_outcome1 = "6";
    }
    if (final_outcome == "4") {
        final_outcome1 = "7";
    }
    if (final_outcome == "5") {
        final_outcome1 = "10";
    }
    let client = await Client.findOne({
        where: { clinic_number: clinic_number }
    });
    if (!client)
        return {
            code: 400,
            message: `Client: ${clinic_number} does not exist in the system. Please register them first.`
        };
    if (client.status != "Active")
        return {
            code: 400,
            message: `Client: ${clinic_number} is not active in the system.`
        };

    let appointment_details = await Appointment.findByPk(appointment_id);
    if (!appointment_details)
        return {
            code: 400,
            message: `Selected appointment for client: ${clinic_number} does not exist in the system.`
        };

    if (moment(call_date).isAfter(new Date().toDateString()))
        return {
            code: 400,
            message: "Tracing date can not be greater than current date"
        };


    if (moment(return_date).isAfter(new Date().toDateString()))
        return {
            code: 200,
            message: "Date of return to care can not be greater than current date"
        };

    call_date = moment(call_date, "DD/MM/YYYY").format("YYYY-MM-DD");
    return_date = moment(return_date, "DD/MM/YYYY").format("YYYY-MM-DD");

    let create_outcome = clientOutcome.create({
        client_id: client.id,
        appointment_id: appointment_details.id,
        outcome: outcome,
        tracer_name: tracer_name,
        created_by: user.id,
        tracing_type: 1,
        app_status: appointment_details.app_status,
        tracing_date: call_date,
        fnl_outcome: final_outcome1,
        return_date: return_date,
        tracing_cost: tracing_cost
    });
    console.log(call_date);
    if (create_outcome) {
        let client_outcome_id = create_outcome.id;
        let no_calls = appointment_details.no_calls;
        if (no_calls < 1) {
            no_calls = 1;
        } else {
            no_calls = no_calls + 1;
        }
        return Appointment.update({
                no_calls: no_calls,
                updated_by: user.id,
                updated_at: today
            }, { returning: true, where: { id: appointment_details.id } })
            .then(([client, updated]) => {
                if (final_outcome == "NULL" || final_outcome == "") {} else {
                    if (final_outcome == 1) {
                        /*

           * Declined Care
              * leave appointment as open and follow up later with the  client.
              * visit types => 'Scheduled','Un-Scheduled','Re-Scheduled'
           *  */
                        Appointment.update({
                                fnl_trcing_outocme: "3",
                                fnl_outcome_dte: today,
                                updated_by: user.id,
                                updated_at: today
                            }, { returning: true, where: { id: appointment_details.id } })
                            .then((updated, appointment) => {})
                            .catch(e => {});
                    }
                    if (final_outcome == 2) {
                        app_date = moment(app_date, "DD/MM/YYYY").format("YYYY-MM-DD");

                        /*

                        * Return to care  
                        * leave appointment as open and follow up later with the  client.
                        *                                                             */

                        /*
                         * Returned to care , close the past active appointment
                         *   and book a new future appointment for the  client
                         */
                        Appointment.update({
                                active_app: "0",
                                appointment_kept: "Yes",
                                fnl_trcing_outocme: "5",
                                fnl_outcome_dte: call_date,
                                date_attended: today
                            }, { returning: true, where: { id: appointment_details.id } })
                            .then((updated, appointment) => {
                                let create_appointment = Appointment.create({
                                    app_status: "Booked",
                                    appntmnt_date: app_date,
                                    status: "Active",
                                    sent_status: "Sent",
                                    client_id: client.id,
                                    created_at: today,
                                    created_by: user.id,
                                    app_type_1: new_appointment_type,
                                    entry_point: "Mobile",
                                    visit_type: "Scheduled",
                                    active_app: "1"
                                });

                                if (new_appointment_type == "6") {
                                    OtherAppointmentType.create({
                                        name: appointment_other,
                                        created_by: user.id,
                                        created_at: today,
                                        appointment_id: appointment_id
                                    });
                                }
                            })
                            .catch(e => {});
                    }
                    if (final_outcome == 3) {
                        /*
                         * Self Transfer
                         * leave appointment as cvlosed and self transfer the  client.
                         */
                        Appointment.update({
                                active_app: "0",
                                fnl_trcing_outocme: "6",
                                fnl_outcome_dte: today,
                                date_attended: today,
                                updated_by: user.id,
                                updated_at: today
                            }, { returning: true, where: { id: appointment_details.id } })
                            .then((updated, client) => {
                                return Client.update({
                                        status: "Self Transfer",
                                        updated_by: user.id,
                                        updated_at: today
                                    }, { returning: true, where: { id: client.id } })
                                    .then((updated, appointment) => {})
                                    .catch(e => {});
                            })
                            .catch(e => {});
                    }
                    if (final_outcome == 4) {
                        /*

          * Dead / Deceased
          * leave appointment as open and follow up later with the  client.
          *                                                                 */

                        Appointment.update({
                                active_app: "0",
                                fnl_trcing_outocme: "7",
                                fnl_outcome_dte: today,
                                date_attended: today,
                                updated_by: user.id,
                                updated_at: today
                            }, { returning: true, where: { id: appointment_details.id } })
                            .then((updated, client) => {
                                Client.update({
                                        status: "Deceased",
                                        updated_by: user.id,
                                        updated_at: today
                                    }, { returning: true, where: { id: client.id } })
                                    .then((updated, appointment) => {})
                                    .catch(e => {});
                            })
                            .catch(e => {});
                    }
                    if (final_outcome == 5) {
                        //Other final outcome , leave appointment as open and follow up later with the  client.

                        OtherFinalOutcome.create({
                            appointment_id: appointment_id,
                            client_outcome_id: client_outcome_id,
                            outcome: other_outcome,
                            created_by: user.id,
                            created_at: today
                        });
                    }
                }
                return Appointment.update({
                        fnl_trcing_outocme: final_outcome,
                        visit_type: "Scheduled",
                        fnl_outcome_dte: call_date
                    }, { returning: true, where: { id: appointment_details.id } })
                    .then(([client, updated]) => {
                        return {
                            code: 200,
                            message: `Outcome for client ${clinic_number} was successfully updated in the system`
                        };
                    })
                    .catch(e => {
                        return {
                            code: 500,
                            message: `Could not update outcome for  client ${clinic_number} `
                        };
                    });
            })
            .catch(e => {
                return {
                    code: 500,
                    message: `Could not update outcome for  client ${clinic_number} `
                };
            });
    } else {
        return {
            code: 500,
            message: "An error occured, could not update Appointment"
        };
    }
    return {
        code: 200,
        message: decoded_message
    };
}
module.exports = processDefaulterDiary;