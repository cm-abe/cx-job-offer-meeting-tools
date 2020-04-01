import {App} from "@slack/bolt";
import {View} from "@slack/types";
import * as helpers from "./helpers";
import meetingInformationForm from "./forms/meeting_infomation.json";

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
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
    const state = view['state'] as FormStates;

    if(helpers.checkJobOfferInformation(state)) {
        console.log("validation error");
        ack({
            "response_action": "errors",
            "errors": {
              "applicant_name_kana": "半角/全角を含む空白や句読点は入力しないでください"
            }
          } as any);
    } else {
        console.log("acknowledge form");
        ack();

        try {
            // create private channel
            const resultCreate = await app.client.conversations.create({
                token: context.botToken,
                name: helpers.generateJobOfferChannel(state),
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
                users: state.values.offer_team_managers.selected_offer_team_manager.selected_users.join()
            });
        } catch(error) {
            console.error(error);
        }
    }
});


(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log("⚡️ Bolt app is running!");
})();
