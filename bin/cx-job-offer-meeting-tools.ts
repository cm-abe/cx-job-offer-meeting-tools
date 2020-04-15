import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import {CxJobOfferMeetingToolsStack} from '../lib/cx-job-offer-meeting-tools-stack';

const app = new cdk.App();
new CxJobOfferMeetingToolsStack(app, 'CxJobOfferMeetingToolsStack');