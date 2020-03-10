import {App} from "@slack/bolt";
import * as helpers from "./helpers";

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listnes to mentions from any user to bot user
app.event("app_mention", async ({event, context}) => {
    try {
        // TODO validation
        console.log("hello");

        // create private channel
        const resultCreate = await app.client.conversations.create({
            token: process.env.SLACK_BOT_TOKEN,
            name: "cx-abe-bot-private-channel-test-retry",
            is_private: true
        });

        console.log("channel created");

        // get id from create channel result
        let createdChannelId = "";

        if(helpers.hasProperty(resultCreate.channel, "id")) {
            if(typeof resultCreate.channel.id === "string") {
                createdChannelId = resultCreate.channel.id;
            }
        }

        console.log(createdChannelId);

        // invite users for private channel
        const resultInviteUsers = await app.client.conversations.invite({
            token: process.env.SLACK_BOT_TOKEN,
            channel: createdChannelId,
            users: process.env.TEST_USER_ID
        });

        // TODO set topic
        // TODO send message for es div
    } catch (error) {
        // console.log(error.data.response_metadata.acceptedScopes);
        console.error(error);
    }
});

// Listens to incoming messages that contain "hello" -> this is sample event! must remove when production deploy.
app.message("hello", ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    say(`Hey threre <@${message.user}>`);
});

// This is a sample for getting user info
app.message("ユーザをあれする", ({ message, say }) => {
    // メンションついてるメッセージの確認 -> メンションの内容がどうなってるか -> Idに展開される
    // user.info
    // find...
    console.log(message);
    console.log(helpers.getMentionsUser(message.text));

    say(`Received!`);
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log("⚡️ Bolt app is running!");
})();
