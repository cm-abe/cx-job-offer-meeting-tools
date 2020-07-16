import cdk = require('@aws-cdk/core');
import {PreProcess} from "./cx-job-offer-meeting-tooks-preprocess";
import * as lambda  from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';

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
            compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
        });

        // create lambda function
        const frontendLambdaFunction = new lambda.Function(this, 'jobOfferMeetingSlackAppFrontend', {
            code: lambda.Code.asset('dist/'),
            handler: `app.handler`,
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: lambdaSlackAppEnvironment,
            layers: [bundleLayer],
        });

        frontendLambdaFunction.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:InvokeFunction'],
            resources: ['*']
        }));

        // create lambda function
        new lambda.Function(this, 'jobOfferMeetingRequestForBuildMeetingChannelBackend', {
            functionName: 'cx-job-offer-supporter-build-channel-operation-backend',
            code: lambda.Code.asset('dist/'),
            handler: `app.badkendToBuildMeetingChannel`,
            runtime: lambda.Runtime.NODEJS_12_X,
            environment: lambdaSlackAppEnvironment,
            layers: [bundleLayer],
        });

        // api gateway
        new apigateway.LambdaRestApi(this, 'jobOfferMeetingSlackAppApi', {
            handler: frontendLambdaFunction,
        });
    }
}