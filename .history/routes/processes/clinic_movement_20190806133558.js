const { Client } = require("../../models/client");
const { Clinic } = require("../../models/clinic");
const base64 = require("base64util");

async function moveClient(message, user) {
    message = message.split("*");
    message = message[1];

    message = message.split("#");
    let decoded_message = await base64.decode(message[0]);
    //below was for testing the decoded message
    // return {
    //     code: 200,
    //     message: decoded_message
    // }

    //check validity of base 64 encode
    if (!(base64.encode(decoded_message) === message[0]))
        return {
            code: 400,
            message: "Your application needs to be updated to use this feature"
        }

    const variables = decoded_message.split("*");
    const ccc_number = variables[0];
    const clinic_id = variables[1];
    let Clinic = await Clinic.findByPk(clinic_id);
    let client = await Client.findOne({ where: { clinic_number: ccc_number } });

    if (!client)
        return {
            code: 400,
            message: `Client: ${ccc_number} does not exist in the system. Please register them first.`
        };
    if (client.status != "Active")
        return {
            code: 400,
            message: `Client: ${ccc_number} is not active in the system.`
        };
    if (client.clinic_id == clinic_id)
        return {
            code: 400,
            message: `Client: ${ccc_number} already exists in the  Clinic : ${Clinic.name} and cannot be moved . `
        };


}
module.exports = moveClient;