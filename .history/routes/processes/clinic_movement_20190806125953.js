const { Client } = require("../../models/client");
const { Clinic } = require("../../models/clinic");
const base64 = require("base64util");

async function moveClient(message, user) {
    message = message.split("*");
    message = message[1];

    message = message.split("#");
    let decoded_message = await base64.decode(message[0]);
    return {
        code: 200,
        message: decoded_message
    }
}
module.exports = moveClient;