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

    //-- Helper function to verify the phone number format to avoid unwanted errors --//
    function verifyNumber(number) {
        if (!number) return false;
        else if (number.match(/^(\+1|1)?\d{10}$/)) return true;
        else if (!number.match(/^(\+1|1)?\d{10}$/)) return false;
    }

    //-- Entire phoneNumber from event input, used as the unique identifier to add and get from DynamoDB --//
    let phoneNumber = event.Details.ContactData.CustomerEndpoint.Address;

    //-- Checking whether or not the number is valid, and if not immediately ends the Lambda and returns error status code and error message --//
    if (!verifyNumber(phoneNumber)) {
        console.log('unsupported');
        callback(null, {
            statusCode: 400,
            body: 'Unsupported phone number',
        })
    }

    //-- Parallel arrays used to match the number to it's corresponding letters --//
    let numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let options = [[], ['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i'], ['j', 'k', 'l'], ['m', 'n', 'o'], ['p', 'q', 'r', 's'], ['t', 'u', 'v'], ['w', 'x', 'y', 'z']];

    //-- A set used to store vanity numbers that are generated, and ultimately stored in DynamoDB --//
    let vanityNumbers = new Set();

    //-- Counter used for testing purposes, which will count how many times the 'walk' function is run --//
    let counter = 0;

    //-- Helper function used to map numbers to options --//
    function indexFinder(number) {
        let index = numbers.findIndex(element => element === number);
        return options[index];
    }

    //-- Recursive function used to calculate the words you are able to create with a given phone number --//
    function walk(string, tracker, output = '', index = 0) {
        counter++; // increments counter to keep track of how many times 'walk' has been invoked
        if (string[index]) { // base case, once the index becomes greater than the word length, 'walk' stops being called
            let letters = indexFinder(string[index]); // gets the letters associated to the number at index from string input
            letters?.forEach(lett => { // used to iterate over each letter from option and perform an action
                let strAdd = output; // 'strAdd' and 'nextIdx' needed to have a more narrowed scope, because 'walk' is essentially being called on 3 different k-ary trees
                let nextIdx = index + 1;
                strAdd += lett; // concatenates the string with the next possible letter
                if (wordList.includes(strAdd) && (strAdd.length + tracker === (phoneNumber.length + 1))) {
                    vanityNumbers.add(`${phoneNumber.substring(0, (tracker - 1))}${strAdd}`);
                } 
                let regex = new RegExp(`^${strAdd}.*`, 'g');
                if (vanityNumbers.size < 5 && wordList.find(word => word.match(regex))) walk(string, tracker, strAdd, nextIdx);
            })
        }
    }

    //-- The starting substring for our 'walk' function, which begins at 5, making our input the last 7 digits from the input phone number --//
    let stringStart = 5;
    let input = event.Details.ContactData.CustomerEndpoint.Address.substring(stringStart);

    //-- If vanity numbers have previously been calculated for our input phone number, Lambda will just return those options --//
    let data = await getFromDB(phoneNumber);

    if (Object.keys(data).length < 1) {
        //-- Iteratively call the walk function, with the input progressively getting shorter --//
        while (input.length >= 4) {
            walk(input, stringStart);
            input = event.Details.ContactData.CustomerEndpoint.Address.substring(stringStart++);
        }

        //-- Join the 'vanityNumber' Set to be a string separated by commas --//
        let result = [...vanityNumbers].join(', ');
        console.log(counter);

        await addToDB(phoneNumber, result)
            .then(() => {
                callback(null, {
                    statusCode: 201,
                    body: result,
                })
            })
            .catch((err) => {
                console.log(err)
            });
    } else {
        callback(null, {
            statusCode: 201,
            body: result,
        })
    }
};

//-- Helper functions to addTo and getFrom DynamoDB table --//
function addToDB(requestId, data) {
    console.log('Add to DB called');
    const params = {
        TableName: "VanityNumbers",
        Item: {
            'phoneNumber': requestId,
            'vanityNumbers': data,
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