import {App} from "@slack/bolt";

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listnes to mentions from any user to bot user
app.event("app_mention", ({event, context}) => {
    try {
        // do something
    } catch (error) {
        console.error(error);
    }
});

// Listens to incoming messages that contain "hello" -> this is sample event! must remove when production deploy.
app.message("hello", ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    say(`Hey threre <@${message.user}>`);
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log("⚡️ Bolt app is running!");
})();
