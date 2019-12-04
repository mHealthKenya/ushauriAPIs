const { Client } = require("../../models/client");
const moment = require("moment");
const base64 = require("base64util");
const { User } = require("../../models/user");

async function transferClient(message, user) {
    message = message.split("*");
    message = message[1];
    message = message.split("#");

    let decoded_message = await base64.decode(message[0]);
    let user_mfl = await User.findOne({ where: { facility_id: user.facility_id } });

    if (!user_mfl) {
        return {
            code: 200,
            message: 'unavailable'
        }

    }
    //base 64 validity check
    if (!(base64.encode(decoded_message).trim() === message[0].trim()))
        return {
            code: 400,
            message: "Your application needs to be updated to use this feature"
        };


    const variables = decoded_message.split("*");
    const ccc_number = variables[0];

    let today = moment(new Date()).format("YYYY-MM-DD");
    let client = await Client.findOne({ where: { clinic_number: ccc_number } });
    if (!client)
        return {
            code: 400,
            message: `Client: ${ccc_number} does not exist in the system. Please register them first.`
        };



    if (user.facility_id == client.mfl_code)
        return {
            code: 400,
            message: 'clieny is already hetre'
                // message: `Client: ${ccc_number} is already in your facility ${user.facility_id}`
        };

    return Client.update({
            prev_clinic: client.mfl_code,
            mfl_code: user.facility_id,
            client_type: 'Transfer',
            updated_at: today,
            updated_by: user.id
        }, { where: { clinic_number: ccc_number } })
        .then(([client, updated]) => {
            return {
                code: 200,
                message: `Client ${ccc_number} has been successfully transfered to your facility ${user.facility_id} `
            };
        })
        .catch(e => {
            return {
                code: 500,
                message: `Could not transfer client ${ccc_number} to your facility.`
            };

        });




}
module.exports = transferClient;