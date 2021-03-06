const {
    Client
} = require("../../models/client");
const moment = require("moment");
const base64 = require("base64util");
const {
    Sender
} = require("../../models/africastalking");
const {
    Message
} = require("../../models/message");


const {
    Appointment
} = require("../../models/appointment");
const {
    OtherAppointmentType
} = require('../../models/other_appointment_types');

async function processAppointment(message, user) {
    message = message.split("*");
    message = message[1];

    message = message.split("#");

    let decoded_message = await base64.decode(message[0]);

    // check if it is a valid base 64 encode
    if (!(base64.encode(decoded_message).trim() === message[0].trim()))
        return {
            code: 400,
            message: "Your application needs to be updated to use this feature"
        };

    decoded_message = "APP*" + decoded_message;

    const variables = decoded_message.split("*");
    if (variables.length != 7)
        return {
            code: 400,
            message: "Your application needs to be updated to use this feature"
        };

    const app = variables[0];
    const upn = variables[1];
    let new_app_date = variables[2];
    let appointment_type = variables[3];
    const appointment_other = variables[4];
    let appointment_kept = variables[5];
    const old_appointment_id = variables[6];
    let today = moment(new Date().toDateString()).format("YYYY-MM-DD");

    if (appointment_kept == 1) {
        appointment_kept = "Yes";
    } else if (appointment_kept == 2) {
        appointment_kept = "No";
    }
    let app_date = moment(new_app_date, "DD/MM/YYYY").format("YYYY-MM-DD");
    if (!app_date || app_date == "1970-01-01") {
        return {
            code: 400,
            message: "Invalid Appointment Date , DD/MM/YYYY is the  appropriate date format"
        };
    }
    let client = await Client.findOne({
        where: {
            clinic_number: upn
        }
    });
    if (!client)
        return {
            code: 400,
            message: ` Appointment was not scheduled in the  system , Client: ${upn} does not exist in the system. Please register them first.`
        };
    if (client.status != "Active")
        return {
            code: 400,
            message: ` Appointment was not scheduled in the  system , Client: ${upn} is not active in the system.`
        };
    if (client.mfl_code != user.facility_id) {
        return {
            code: 400,
            message: `Client ${upn} does not belong to your facility. The client is registered under MFL Code ${client.mfl_code}`
        };
    }

    if (app_date > today) {
        if (old_appointment_id == "-1") {
            let existing_appointments = await Appointment.count({
                where: {
                    client_id: client.id
                }
            });

            if (existing_appointments === 0) {
                //new booking, no record of previous appointment
                //create new appointment
                return Appointment.create({
                    app_status: "Booked",
                    appntmnt_date: app_date,
                    status: "Active",
                    sent_status: "Sent",
                    client_id: client.id,
                    created_at: today,
                    created_by: user.id,
                    app_type_1: appointment_type,
                    entry_point: "Mobile",
                    visit_type: "Scheduled",
                    active_app: "1"
                }).then((new_app) => {
                    if (appointment_type == "6") {
                        return OtherAppointmentType.create({
                            name: appointment_other,
                            created_by: user.id,
                            created_at: today,
                            appointment_id: new_app.id
                        }).then((other_app) => {
                            return {
                                code: 200,
                                message: `Appointment for ${client.f_name} UPN: ${upn} on ${app_date} was created successfully`
                            };
                        }).catch(e => {
                            return {
                                code: 200,
                                message: "An error occured, could not create other  Appointment type "
                            };
                        })

                    }
                    return {
                        code: 200,
                        message: `Appointment for ${client.f_name} UPN:  ${upn} on ${app_date} was created successfully`
                    };
                }).catch(e => {
                    return {
                        code: 500,
                        message: "An error occured, could not create Appointment"
                    };
                })

            } else {
                // appointment history exists

                let active_appointment = await Appointment.count({
                    where: {
                        client_id: client.id,
                        active_app: "1"
                    }
                });
                if (active_appointment > 0) {
                    //check if date of appointment is less than today
                    let active_appointment_details = await Appointment.findOne({
                        where: {
                            client_id: client.id,
                            active_app: "1"
                        }
                    });
                    //if less, redirect user to the defaulter diary to update appointment

                    if (
                        moment(active_appointment_details.appntmnt_date).isBefore(
                            new Date().toDateString()
                        )
                    ) {
                        return {
                            code: 400,
                            message: `Client ${upn} missed an appointment on date ${
                active_appointment_details.appntmnt_date
              }. Kindly update them from the defaulter diary`
                        };
                    } else if (
                        moment(active_appointment_details.appntmnt_date).isSame(
                            new Date().toDateString()
                        )
                    ) {
                        return {
                            code: 400,
                            message: `Client ${upn} has an active appointment today. Kindly update them from today's appointments`
                        };
                    } else {
                        //if greater than today, if current active date is equal to new app date, return error

                        if (
                            moment(active_appointment_details.appntmnt_date).isSame(app_date)
                        )
                            return {
                                code: 400,
                                message: `Client ${upn} already has an appointment on ${app_date} and cannot be booked again.`
                            };
                        //if new app date - today > 30 days, return cannot book unscheduled > 30 days

                        //let diff_days = moment(app_date).diff(today, "days");
                        // if (diff_days > 30) {
                        //     return {
                        //         code: 400,
                        //         message: `Cannot book an Un-Scheduled visit which is more than 30 days from the original date of appointment`
                        //     };
                        // }
                        // if less than 30 days, book unscheduled

                        return Appointment.update({
                                appointment_kept: "Yes",
                                date_attended: today,
                                active_app: "0",
                                updated_at: today,
                                unscheduled_date: today,
                                updated_by: user.id,
                                app_status: "Notified",
                                visit_type: "Un-Scheduled"
                            }, {
                                where: {
                                    id: active_appointment_details.id
                                }
                            })
                            .then(([updated, old_app]) => {
                                if (updated) {
                                    //create new appointment
                                    return Appointment.create({
                                        app_status: "Booked",
                                        appntmnt_date: app_date,
                                        status: "Active",
                                        sent_status: "Sent",
                                        client_id: client.id,
                                        created_at: today,
                                        created_by: user.id,
                                        app_type_1: appointment_type,
                                        entry_point: "Mobile",
                                        visit_type: "Scheduled",
                                        active_app: "1"
                                    }).then((new_app) => {
                                        if (appointment_type == "6") {
                                            return OtherAppointmentType.create({
                                                name: appointment_other,
                                                created_by: user.id,
                                                created_at: today,
                                                appointment_id: new_app.id
                                            }).then((other_app) => {
                                                return {
                                                    code: 200,
                                                    message: `Appointment for ${client.f_name} UPN: ${upn} on ${app_date} was created successfully`
                                                };
                                            }).catch(e => {
                                                return {
                                                    code: 200,
                                                    message: "An error occured, could not create other  Appointment type "
                                                };
                                            })

                                        }
                                        return {
                                            code: 200,
                                            message: `Appointment for ${client.f_name} UPN:  ${upn} on ${app_date} was created successfully`
                                        };
                                    }).catch(e => {
                                        return {
                                            code: 500,
                                            message: "An error occured, could not create Appointment"
                                        };
                                    })
                                }
                            })
                            .catch(e => {
                                return {
                                    code: 500,
                                    message: "An error occured, could not create Appointment"
                                };
                            });
                    }
                } else {
                    //no active appointment exits, create new appointemnt
                    return Appointment.create({
                        app_status: "Booked",
                        appntmnt_date: app_date,
                        status: "Active",
                        sent_status: "Sent",
                        client_id: client.id,
                        created_at: today,
                        created_by: user.id,
                        app_type_1: appointment_type,
                        entry_point: "Mobile",
                        visit_type: "Scheduled",
                        active_app: "1"
                    }).then((new_app) => {
                        if (appointment_type == "6") {
                            return OtherAppointmentType.create({
                                name: appointment_other,
                                created_by: user.id,
                                created_at: today,
                                appointment_id: new_app.id
                            }).then((other_app) => {
                                return {
                                    code: 200,
                                    message: `Appointment for ${client.f_name} UPN : ${upn} on ${app_date} was created successfully`
                                };
                            }).catch(e => {
                                return {
                                    code: 200,
                                    message: "An error occured, could not create other  Appointment type "
                                };
                            })

                        }
                        return {
                            code: 200,
                            message: `Appointment for ${client.f_name} UPN : ${upn} on ${app_date} was created successfully`
                        };
                    }).catch(e => {
                        return {
                            code: 500,
                            message: "An error occured, could not create Appointment"
                        };
                    })
                }
            }
        } else {
            //get appointment where id is old app id
            // if old app is today, confirm current as kept, create new

            let current_active_appointment = await Appointment.findByPk(
                old_appointment_id
            );
            if (!current_active_appointment)
                return {
                    code: 400,
                    message: `The appointment you tried to update does not exist.`
                };
            let active_appointment_date = moment(
                current_active_appointment.appntmnt_date
            );
            let current_date = moment(new Date().toDateString());
            let diffDays = current_date.diff(active_appointment_date, "days");
            if (diffDays === 0) {
                //mark active appointment as kept

                const active_appointment_on_same_date = await Appointment.count({
                    where: {
                        appntmnt_date: app_date,
                        client_id: client.id
                    }
                });

                if (active_appointment_on_same_date === 0) {
                    return Appointment.update({
                            appointment_kept: "Yes",
                            date_attended: today,
                            active_app: "0",
                            updated_at: today,
                            updated_by: user.id,
                            app_status: "Notified",
                            visit_type: "Scheduled"
                        }, {
                            where: {
                                id: old_appointment_id
                            }
                        })
                        .then(async([updated, old_app]) => {


                            if (updated) {
                                //create new appointment
                                return Appointment.create({
                                    app_status: "Booked",
                                    appntmnt_date: app_date,
                                    status: "Active",
                                    sent_status: "Sent",
                                    client_id: client.id,
                                    created_at: today,
                                    created_by: user.id,
                                    app_type_1: appointment_type,
                                    entry_point: "Mobile",
                                    visit_type: "Scheduled",
                                    active_app: "1"
                                }).then(async(new_app) => {
                                    if (appointment_type == "6") {
                                        return OtherAppointmentType.create({
                                            name: appointment_other,
                                            created_by: user.id,
                                            created_at: today,
                                            appointment_id: new_app.id
                                        }).then((other_app) => {
                                            return {
                                                code: 200,
                                                message: `Appointment for ${upn} on ${app_date} was created successfully`
                                            };
                                        }).catch(e => {
                                            return {
                                                code: 200,
                                                message: "An error occured, could not create other  Appointment type "
                                            };
                                        })

                                    }

                                    //console.log(`client is : ${client.smsenable}`);



                                    if (client.smsenable == "Yes" && client.language_id != 5) {
                                        let message = await Message.findOne({
                                            where: {
                                                message_type_id: 1,
                                                logic_flow: 1,
                                                language_id: client.language_id
                                            }
                                        });
                                        let phone;
                                        message = message.message;
                                        let new_message = message.replace("XXX", client.f_name);
                                        console.log(`Message: ${new_message}`)

                                        if (client.phone_no != null) {
                                            phone = client.phone_no
                                        } else if (client.phone_no == null && client.alt_phone_no != null) {
                                            phone = client.alt_phone_no

                                        }

                                        if (phone) {
                                            Sender(phone, new_message);
                                        }
                                    }

                                    return {
                                        code: 200,
                                        message: `Appointment for ${upn} on ${app_date} was created successfully`
                                    };
                                }).catch(e => {
                                    return {
                                        code: 500,
                                        message: "An error occured, could not create Appointment"
                                    };
                                })


                            }





                        })
                        .catch(e => {
                            return {
                                code: 500,
                                message: "An error occured, could not update old Appointment"
                            };
                        });

                } else {
                    return {
                        code: 400,
                        message: `Client ${upn} already has an appointment on ${app_date} and cannot be booked again.`
                    };
                }
            } else {
                return {
                    code: 500,
                    message: "An error occured, could not create Appointment"
                };
            }
        }
    } else {
        return {
            code: 400,
            message: `Appointments can only be booked for dates greater than today.`
        };
    }
}

module.exports = processAppointment;