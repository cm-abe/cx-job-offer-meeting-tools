import {App, ExpressReceiver, LogLevel} from "@slack/bolt";
import {View} from "@slack/types";
import * as helpers from "./helpers";
import meetingInformationForm from "./forms/meeting_infomation.json";
import {JobOfferMeeting} from "./domain/job_offer_meeting";
import AWS = require('aws-sdk');
import { ApplicationError } from "./error/application_error";

const expressReceiver = new ExpressReceiver ({
    signingSecret: process.env.SLACK_SIGNING_SECRET
  });

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver: expressReceiver,
    logLevel: LogLevel.DEBUG
});

app.error(helpers.printCompleteJSON);

// Listens to incoming messages that contain "hello" -> this is sample event! must remove when production deploy.
app.message("hello", ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    console.log("call hello message");
    say(`Hey threre <@${message.user}>`);
});

app.command("/二次面接準備", async ({ ack, body, context }) => {
    console.log("call meeting form command");

    const createChannelArg: CreateChannelRequestArg = {
        token: context.botToken,
        triggerId: body.trigger_id
    }

    const response = await openMeetingInformationView(createChannelArg);
    console.log(response);

    ack();
});

// receive and validation
app.view("meeting_information", async({ ack, body, view, context }) => {
    const jobOfferMeeting = new JobOfferMeeting(view['state'] as FormStates);

    // validate and error logic into try block
    const resultValidation = jobOfferMeeting.validateForm();

    if(resultValidation != undefined) {
        console.log("acknowledge form");
        console.log("validation error");
        ack(resultValidation);
    } else {
        const buildChannelArg: BuildMeetingChannelArg = {
            token: context.botToken,
            meetingInformationForm: view['state'] as FormStates
        }

        const lambda = new AWS.Lambda();
        const params: AWS.Lambda.InvocationRequest = {
            InvocationType: 'Event', // async invocation
            FunctionName: 'cx-job-offer-supporter-build-channel-operation-backend',
            Payload: JSON.stringify(buildChannelArg)
        };
        const response = await lambda.invoke(params).promise();
        console.log(response);

        console.log("success build");

        ack();
    }
});

const awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(expressReceiver.app);

// Lambda interface
export const handler = (event: any, context: any) => awsServerlessExpress.proxy(server, event, context);

type CreateChannelRequestArg = {
    token: string,
    triggerId: string
};

function openMeetingInformationView(arg: CreateChannelRequestArg): Promise<void> {
    return app.client.views
        .open({
            token: arg.token,
            trigger_id: arg.triggerId,
            view: meetingInformationForm as View
        })
        .then(helpers.printCompleteJSON)
        .catch(helpers.printCompleteJSON);
}

export const badkendToBuildMeetingChannel = async (event: any, context: any) => {
    await buildMeetingChannel(event);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'done'
        })
    };
}

type BuildMeetingChannelArg = {
    token: string,
    meetingInformationForm: FormStates
}

async function buildMeetingChannel(arg: BuildMeetingChannelArg) {
    const meetingInformation = new JobOfferMeeting(arg.meetingInformationForm);

    try {
        // create private channel
        const createdChannelId = await createPrivateChannel(arg.token, meetingInformation.getJobOfferChannelName());
        console.log("created channel");

        // invite users for private channel
        await addPrivateChannelMember(
            arg.token,
            createdChannelId,
            meetingInformation.getChannelUsers().join()
        );
    } catch(error) {
        console.error(error);
    }
}

function createPrivateChannel(token: string, channelName: string): Promise<string> {
    console.log(channelName);

    return app.client.conversations
        .create({
            token: token,
            name: channelName,
            is_private: true
        })
        .then(result => {
            if(helpers.hasProperty(result.channel, "id")) {
                if(typeof result.channel.id === "string") {
                    console.log(`channel created. id is ${result.channel.id}`);
                    return result.channel.id;
                }
            }

            throw new ApplicationError(`channel id is not found. ${result}`);
        });
}

function addPrivateChannelMember(token: string, channelId: string, users: string): Promise<void> {
    return app.client.conversations
        .invite({
            token: token,
            channel: channelId,
            users: users
        })
        .then(helpers.printCompleteJSON)
        .catch(helpers.printCompleteJSON);
}

// on local server
// (async () => {
//     // Start your app
//     await app.start(process.env.PORT || 3000);

//     console.log("⚡️ Bolt app is running!");
// })();
