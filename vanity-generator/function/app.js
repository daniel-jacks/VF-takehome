//-- Bring in the aws-sdk, and used the DocumentClient constructor --//
//-- The Document Client acts as an interpreter between JavaScript and DynamoDB --//
const AWS = require('aws-sdk');
AWS.config.update({ region: "us-west-2" });
const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

//-- Here is the word list we use to check if the strings returned from our function are actual words --//
const fs = require('fs');
const wordListPath = require('word-list');
const wordList = fs.readFileSync(wordListPath, 'utf8').split('\n');
exports.lambdaHandler = async (event, context, callback) => {

    let phoneNumber = event.Details.ContactData.CustomerEndpoint.Address;

    let options = [[], ['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i'], ['j', 'k', 'l'], ['m', 'n', 'o'], ['p', 'q', 'r', 's'], ['t', 'u', 'v'], ['w', 'x', 'y', 'z']];
    let numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let vanityNumbers = new Set();

    function helper(number) {
        let index = numbers.findIndex(element => element === number);
        return options[index];
    }

    function walk(string, tracker, output = '', index = 0) {
        if (string[index]) {
            let letters = helper(string[index]);
            letters?.forEach(lett => {
                let strAdd = output;
                let nextIdx = index + 1;
                strAdd += lett;
                if (wordList.includes(strAdd) && (strAdd.length + tracker === (phoneNumber.length + 1))) {
                    vanityNumbers.add(`${phoneNumber.substring(0, (tracker - 1))}${strAdd}`);
                } 
                if (vanityNumbers.size < 5) walk(string, tracker, strAdd, nextIdx);
            })
        }
    }

    // +11236228464
    let stringStart = 6;
    let input = event.Details.ContactData.CustomerEndpoint.Address.substring(stringStart);
    console.log(input)
    while (input.length >= 3) {
        walk(input, stringStart);
        input = event.Details.ContactData.CustomerEndpoint.Address.substring(stringStart++);
    }

    let result = [...vanityNumbers].join(', ');

    let data = await getFromDB(phoneNumber)
    if (Object.keys(data).length < 1) {
        await addToDB(phoneNumber, result)
            .then(() => {
                callback(null, {
                    statusCode: 201,
                    body: '',
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                })
            })
            .catch((err) => {
                console.log(err)
            });
    } else {
        console.log(data);
        return data;
    }
};

// function verifyNumber(number) {

//     if (number.match(/^(\+1|1)?\d{10}$/)) {
//         let cleanNumber = number.replace(/^(\+1|1)/)
//     }
// }

function addToDB(requestId, data) {
    console.log('Add to DB called');
    const params = {
        TableName: "VanityNumbers",
        Item: {
            'phoneNumber': requestId,
            'message': data,
        }
    }
    return ddb.put(params).promise();
}

function getFromDB(requestId) {
    console.log('Get from DB called');
    const params = {
        TableName: "VanityNumbers",
        Key: {
            'phoneNumber': requestId,
        }
    }
    return ddb.get(params).promise();
}