'use strict';

const app = require('../../app.js');
const expect = require('chai').expect;
const sinon = require('sinon');
const { DynamoDB } = require('aws-sdk');
let event, context;

const sandbox = sinon.createSandbox();

describe('Tests vanity generator', function () {
    const log = sinon.spy(console, 'log');

    it('verifies successful response if phone number already exists in database', async () => {
        let data = { Item: { vanityNumbers: '+1800testing, +1800verting, +1800vesting, +180083ruing, +180083sting' } };
        sandbox.stub(DynamoDB.DocumentClient.prototype, 'get').returns({ promise: () => data });
        const callback = sinon.spy();

        event = {
            Name: 'ContactFlowEvent',
            Details: {
                ContactData: {
                    Attributes: {},
                    Channel: 'VOICE',
                    ContactId: '5ca32fbd-8f92-46af-92a5-6b0f970f0efe',
                    CustomerEndpoint: {
                        Address: '+18008378464',
                        Type: 'TELEPHONE_NUMBER'
                    },
                    InitialContactId: '5ca32fbd-8f92-46af-92a5-6b0f970f0efe',
                    InitiationMethod: 'API',
                    InstanceARN: 'arn:aws:connect:us-east-1:123456789012:instance/9308c2a1-9bc6-4cea-8290-6c0b4a6d38fa',
                    MediaStreams: {
                        Customer: {
                            Audio: {
                                StartFragmentNumber: '91343852333181432392682062622220590765191907586',
                                StartTimestamp: '1565781909613',
                                StreamARN: 'arn:aws:kinesisvideo:us-east-1:123456789012:stream/connect-contact-a3d73b84-ce0e-479a-a9dc-5637c9d30ac9/1565272947806'
                            }
                        }
                    },
                    PreviousContactId: '5ca32fbd-8f92-46af-92a5-6b0f970f0efe',
                    Queue: null,
                    SystemEndpoint: {
                        Address: '+11234567890',
                        Type: 'TELEPHONE_NUMBER'
                    }
                },
                Parameters: {}
            }
        }

        const result = await app.lambdaHandler(event, context, callback);

        expect(result).to.be.an('string');
        expect(result).to.equal('+1800testing, +1800verting, +1800vesting, +180083ruing, +180083sting');
        expect(callback.callCount).to.equal(1);
        expect(log.callCount).to.equal(1);
    });

    it('verifies successful response if phone number does not already exist in database', async () => {
        sandbox.restore();
        let data = { result: '+1800testing, +1800verting, +1800vesting, +180083ruing, +180083sting' };
        let empty = {};
        sandbox.stub(DynamoDB.DocumentClient.prototype, 'get').returns({ promise: () => empty });
        sandbox.stub(DynamoDB.DocumentClient.prototype, 'put').returns({ promise: () => data });
        const callback = sinon.spy();

        event = {
            Name: 'ContactFlowEvent',
            Details: {
                ContactData: {
                    Attributes: {},
                    Channel: 'VOICE',
                    ContactId: '5ca32fbd-8f92-46af-92a5-6b0f970f0efe',
                    CustomerEndpoint: {
                        Address: '+18008378464',
                        Type: 'TELEPHONE_NUMBER'
                    },
                    InitialContactId: '5ca32fbd-8f92-46af-92a5-6b0f970f0efe',
                    InitiationMethod: 'API',
                    InstanceARN: 'arn:aws:connect:us-east-1:123456789012:instance/9308c2a1-9bc6-4cea-8290-6c0b4a6d38fa',
                    MediaStreams: {
                        Customer: {
                            Audio: {
                                StartFragmentNumber: '91343852333181432392682062622220590765191907586',
                                StartTimestamp: '1565781909613',
                                StreamARN: 'arn:aws:kinesisvideo:us-east-1:123456789012:stream/connect-contact-a3d73b84-ce0e-479a-a9dc-5637c9d30ac9/1565272947806'
                            }
                        }
                    },
                    PreviousContactId: '5ca32fbd-8f92-46af-92a5-6b0f970f0efe',
                    Queue: null,
                    SystemEndpoint: {
                        Address: '+11234567890',
                        Type: 'TELEPHONE_NUMBER'
                    }
                },
                Parameters: {}
            }
        }

        const result = await app.lambdaHandler(event, context, callback);
        expect(result).to.be.an('string');
        expect(result).to.equal('+1800testing, +1800verting, +1800vesting, +180083ruing, +180083sting');
        expect(callback.callCount).to.equal(1);
        expect(log.callCount).to.equal(4);
    });

    it('test verifyNumber will return error message if phone number is blank or unsupported', async () => {
        sandbox.restore();
        const callback = sinon.spy();

        event = {
            Name: 'ContactFlowEvent',
            Details: {
                ContactData: {
                    Attributes: {},
                    Channel: 'VOICE',
                    ContactId: '5ca32fbd-8f92-46af-92a5-6b0f970f0efe',
                    CustomerEndpoint: {
                        Address: '+1800622846', // This phone number is only 10 characters long, and is supposed to be 11
                        Type: 'TELEPHONE_NUMBER'
                    },
                    InitialContactId: '5ca32fbd-8f92-46af-92a5-6b0f970f0efe',
                    InitiationMethod: 'API',
                    InstanceARN: 'arn:aws:connect:us-east-1:123456789012:instance/9308c2a1-9bc6-4cea-8290-6c0b4a6d38fa',
                    MediaStreams: {
                        Customer: {
                            Audio: {
                                StartFragmentNumber: '91343852333181432392682062622220590765191907586',
                                StartTimestamp: '1565781909613',
                                StreamARN: 'arn:aws:kinesisvideo:us-east-1:123456789012:stream/connect-contact-a3d73b84-ce0e-479a-a9dc-5637c9d30ac9/1565272947806'
                            }
                        }
                    },
                    PreviousContactId: '5ca32fbd-8f92-46af-92a5-6b0f970f0efe',
                    Queue: null,
                    SystemEndpoint: {
                        Address: '+11234567890',
                        Type: 'TELEPHONE_NUMBER'
                    }
                },
                Parameters: {}
            }
        }

        const result = await app.lambdaHandler(event, context, callback);
        expect(result).to.be.an('string');
        expect(result).to.equal('unsupported phone number');
        expect(callback.callCount).to.equal(1);
    });
});
