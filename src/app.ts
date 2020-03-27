import {App} from "@slack/bolt";
import {View} from "@slack/types";
import * as helpers from "./helpers";
import meetingInformationForm from "./forms/meeting_infomation.json";

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listnes to mentions from any user to bot user
app.event("app_mention", async ({event, context}) => {
    try {
        // extract mentioned users from message text
        const mentionedUsers = Array.from(new Set(
            helpers.getMentionsUser(event.text)
                   .map(mention => mention.substr(2,9))
                   .filter(userId => userId !== context.botUserId)));

        console.log(mentionedUsers);

        // create private channel
        const resultCreate = await app.client.conversations.create({
            token: context.botToken,
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
            token: context.botToken,
            channel: createdChannelId,
            users: mentionedUsers.join()
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
    ack();

    const state = view['state'] as FormStates;

    console.log(state.values.applicant_name.entered_applicant_name.value);
    console.log(state.values.applicant_name_kana.entered_applicant_name_kana.value);
    console.log(state.values.job_type.selected_job_type.selected_option);
    console.log(state.values.offer_team_managers.selected_offer_team_manager.selected_users);

    const regInvalidChannelNamePattern = /[  ,.、。]/g
    console.log(state.values.applicant_name_kana.entered_applicant_name_kana.value.match(regInvalidChannelNamePattern));
    // [  ,.、。]
    // ack -> response_action: error, block: applicant_name_kana, message
});


(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log("⚡️ Bolt app is running!");
})();
