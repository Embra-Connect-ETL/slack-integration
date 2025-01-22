const { WebClient } = require('@slack/web-api');

const options = {};
const web = new WebClient(process.env.SLACK_TOKEN, options);

const sendSlackMessage = async (message, channel = null) => {
    return new Promise(async (resolve, reject) => {
        const channelId = channel || process.env.SLACK_CHANNEL_ID;
        try {
            // Check if the bot is a member of the channel
            const isMember = await isChannelMember(channelId);
            if (!isMember) {
                console.log(`Bot is not a member of the channel ${channelId}`);
                await joinSlackChannel(channelId);
            }

            const resp = await web.chat.postMessage({
                text: message,
                channel: channelId,
            });
            return resolve(true);
        } catch (error) {
            const errorMessage = error?.data?.error;
            if (errorMessage == 'not_in_channel') {
                console.log('not in channel');
                await joinSlackChannel(channelId, message);
            }
            return resolve(true);
        }
    });
};

const isChannelMember = async (channel) => {
    try {
        const resp = await web.conversations.members({
            channel: channel,
        });
        const members = resp.members || [];
        return members.includes(await getBotUserId());
    } catch (error) {
        console.error('Error checking channel membership:', error);
        return false;
    }
};

const getBotUserId = async () => {
    try {
        const resp = await web.auth.test();
        return resp.user_id;
    } catch (error) {
        console.error('Error getting bot user ID:', error);
        throw error;
    }
};

const joinSlackChannel = (channel, message = null) => {
    return new Promise(async (resolve, reject) => {
        try {
            const resp = await web.conversations.join({
                channel: channel,
            });
            if (message) {
                await sendSlackMessage(message, channel);
            }
            return resolve(true);
        } catch (error) {
            return resolve(true);
        }
    });
};

module.exports = {
    sendSlackMessage,
    joinSlackChannel,
    isChannelMember,
    getBotUserId
};