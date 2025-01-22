require('dotenv').config();
const { sendSlackMessage } = require('./helpers/slack');

console.log("Slack notification service is running...");
const sendMessage = async (msg) => {
    await sendSlackMessage(msg);
}

sendMessage("Testing slack messages...");
