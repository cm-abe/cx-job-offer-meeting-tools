import cdk = require('@aws-cdk/core');
import {PreProcess} from "./cx-job-offer-meeting-tooks-preprocess";
import * as lambda  from '@aws-cdk/aws-lambda';
import { Duration } from '@aws-cdk/core';

export class CxJobOfferMeetingToolsStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        var region: string;
        if(props && props.env && props.env.region) {
            region = props.env.region;
        } else {
            region = "ap-northeast-1";
        }

        // Environment variable for lambda function
        require("dotenv").config();
        var lambdaSlackAppEnvironment = {
            SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
            SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET
        };

        // create lambda layer
        const bundleLayer = new lambda.LayerVersion(this, 'lambdaBundleLayer', {
            layerVersionName: 'cx-job-offer-meeting-tools-layer',
            code: new lambda.AssetCode(PreProcess.BUNDLE_LAYER_BASE_DIR),
            compatibleRuntimes: [lambda.Runtime.NODEJS_10_X],
        });

        const lambdaFunction = new lambda.Function(this, 'jobOfferMeetingSlackApp', {
            code: lambda.Code.asset('dist/'),
            handler: `app.handler`,
            runtime: lambda.Runtime.NODEJS_10_X,
            timeout: Duration.seconds(3),
            environment: lambdaSlackAppEnvironment,
            layers: [bundleLayer],
        });
    }
}

// Pre Process
PreProcess.generateBundlePackage();

// Main build process
const app = new cdk.App();
new CxJobOfferMeetingToolsStack(app, 'CxJobOfferMeetingTools');
app.synth();