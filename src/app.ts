import {App, ExpressReceiver} from "@slack/bolt";
import {View} from "@slack/types";
import * as helpers from "./helpers";
import meetingInformationForm from "./forms/meeting_infomation.json";
import {JobOfferMeeting} from "./domain/job_offer_meeting";

const expressReceiver = new ExpressReceiver ({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    endpoints: '/events'
  });

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});

// Listens to incoming messages that contain "hello" -> this is sample event! must remove when production deploy.
app.message("hello", ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    say(`Hey threre <@${message.user}>`);
});

app.command("/二次面接準備", ({ ack, body, context }) => {
    ack();

    try {
        const result = app.client.views.open({
            token: context.botToken,
            trigger_id: body.trigger_id,
            view: meetingInformationForm as View
        });
        console.log(result);
    } catch (error) {
        console.error(error);
    }
});

// receive and validation
app.view("meeting_information", async({ ack, body, view, context }) => {
    const jobOfferMeeting = new JobOfferMeeting(view['state'] as FormStates);

    // validate and error logic into try block
    ack(jobOfferMeeting.validateForm());

    console.log("acknowledge form");

    try {
        // create private channel
        console.log(jobOfferMeeting.getJobOfferChannelName());
        const resultCreate = await app.client.conversations.create({
            token: context.botToken,
            name: jobOfferMeeting.getJobOfferChannelName(),
            is_private: true
        });

        // get id from create channel result
        let createdChannelId = "";

        if(helpers.hasProperty(resultCreate.channel, "id")) {
            if(typeof resultCreate.channel.id === "string") {
                createdChannelId = resultCreate.channel.id;
            }
        }

        console.log(`channel created. id is ${createdChannelId}`);

        // invite users for private channel
        const resultInviteUsers = await app.client.conversations.invite({
            token: context.botToken,
            channel: createdChannelId,
            users: jobOfferMeeting.getChannelUsers().join()
        });
    } catch(error) {
        console.error(error);
    }
});

const awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(expressReceiver.app);

export async function handler(event: any, context: any) {
    awsServerlessExpress.proxy(server, event, context);
}

// on local server
// (async () => {
//     // Start your app
//     await app.start(process.env.PORT || 3000);

//     console.log("⚡️ Bolt app is running!");
// })();
