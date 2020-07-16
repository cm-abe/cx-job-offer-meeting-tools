import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import {CxJobOfferMeetingToolsStack} from '../lib/cx-job-offer-meeting-tools-stack';
import {PreProcess} from '../lib/cx-job-offer-meeting-tooks-preprocess';

// Pre Process
PreProcess.generateBundlePackage();

// Main Process
const app = new cdk.App();
new CxJobOfferMeetingToolsStack(app, 'CxJobOfferMeetingToolsStack');