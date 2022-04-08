'use strict';

const app = require('../../app.js');
const chai = require('chai');
const AWSMock = require('aws-sdk-mock');
const expect = chai.expect;
let event, context;

describe('Tests vanity generator', function () {
    console.log('here', AWSMock);

    it('verifies successful response', async () => {
        event = {
            Name: "ContactFlowEvent",
            Details: {
                ContactData: {
                    Attributes: {},
                    Channel: "VOICE",
                    ContactId: "5ca32fbd-8f92-46af-92a5-6b0f970f0efe",
                    CustomerEndpoint: {
                        Address: "+11232223369",
                        Type: "TELEPHONE_NUMBER"
                    },
                    InitialContactId: "5ca32fbd-8f92-46af-92a5-6b0f970f0efe",
                    InitiationMethod: "API",
                    InstanceARN: "arn:aws:connect:us-east-1:123456789012:instance/9308c2a1-9bc6-4cea-8290-6c0b4a6d38fa",
                    MediaStreams: {
                        Customer: {
                            Audio: {
                                StartFragmentNumber: "91343852333181432392682062622220590765191907586",
                                StartTimestamp: "1565781909613",
                                StreamARN: "arn:aws:kinesisvideo:us-east-1:123456789012:stream/connect-contact-a3d73b84-ce0e-479a-a9dc-5637c9d30ac9/1565272947806"
                            }
                        }
                    },
                    PreviousContactId: "5ca32fbd-8f92-46af-92a5-6b0f970f0efe",
                    Queue: null,
                    SystemEndpoint: {
                        Address: "+11234567890",
                        Type: "TELEPHONE_NUMBER"
                    }
                },
                Parameters: {}
            }
        }

        const result = await app.lambdaHandler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.message).to.be.equal('0 luck, 1 ta, 1 taj, 1 tak, 2 al');
        // expect(response.location).to.be.an("string");
    });
});
