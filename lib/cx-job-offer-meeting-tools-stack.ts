import cdk = require('@aws-cdk/core');

export class CxJobOfferMeetingToolsStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
    }
}

// Main build process
const app = new cdk.App();
new CxJobOfferMeetingToolsStack(app, 'CxJobOfferMeetingTools');
app.synth();