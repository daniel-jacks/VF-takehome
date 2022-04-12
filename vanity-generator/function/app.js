//-- Bring in the aws-sdk, and used the DocumentClient constructor --//
//-- The Document Client acts as an interpreter between JavaScript and DynamoDB --//
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });

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
        callback(null, {
            statusCode: 400,
            body: 'Unsupported phone number',
        })
        return 'unsupported phone number';
    }

    //-- Parallel arrays used to match the number to it's corresponding letter options --//
    let numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let options = [[], ['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i'], ['j', 'k', 'l'], ['m', 'n', 'o'], ['p', 'q', 'r', 's'], ['t', 'u', 'v'], ['w', 'x', 'y', 'z']];

    //-- A Set used to store vanity numbers that are generated, and ultimately stored in DynamoDB --//
    let vanityNumbers = new Set(); // Set is used to avoid any chance of duplicated words

    //-- Counter used for testing purposes, which will count how many times the 'step' function is run --//
    let counter = 0;

    //-- Helper function used to map numbers to options --//
    function letterFinder(number) {
        let index = numbers.findIndex(element => element === number);
        return options[index];
    }

    //-- Recursive function used to calculate the words you are able to create with a given phone number --//
    function step(string, tracker, output = '', index = 0) {
        counter++; // increments 'counter' to keep track of how many times 'step' has been invoked
        if (string[index]) { // BASE CASE, once the index becomes greater than the 'string' length, 'step' stops being called
            let letters = letterFinder(string[index]); // gets the letters associated to the number at 'index' from 'string' input
            letters?.forEach(letter => { // used to iterate over each letter from 'letters' and perform an action
                let strAdd = output; // 'strAdd' and 'nextIdx' needed to have a more narrowed scope, because 'step' is essentially being called on 3 different k-ary trees
                let nextIdx = index + 1;
                strAdd += letter; // concatenates 'string' with the next possible letter
                //-- Adds word to 'vanityNumbers' if the word is included in 'wordList' AND if the word uses all available digits from input --//
                if (wordList.includes(strAdd) && (strAdd.length + (tracker - 1) === (phoneNumber.length)) && vanityNumbers.size < 5) { 
                    vanityNumbers.add(`${phoneNumber.substring(0, (tracker - 1))}${strAdd}`);
                };
                //-- BASE CASE, Uses Regex to determine if there is a word in 'wordList' array that begins with the current string, if not no longer calls 'step' --//
                let regex = new RegExp(`^${strAdd}.*`, 'g');
                if (vanityNumbers.size < 5 && wordList.find(word => word.match(regex))) step(string, tracker, strAdd, nextIdx);
            })
        }
    }

    //-- The starting substring for our 'step' function, which begins at 5, making our input the last 7 digits from the input phone number --//
    let stringStart = 5;
    let input = phoneNumber.substring(stringStart);

    //-- If vanity numbers have previously been calculated for our input phone number, Lambda will just return those options --//
    let data = await getFromDB(phoneNumber);
    let textToSpeech;

    if (Object.keys(data)?.length < 1) {
        //-- Iteratively call the 'step' function, with the input progressively getting shorter --//
        let minVanityLength = 4; // Potentially ask a caller for input and ask for their minimum length vanity word
        while (input.length >= minVanityLength) {
            step(input, stringStart);
            input = phoneNumber.substring(stringStart++);
        };

        //-- Join the 'vanityNumber' Set to be a string separated by commas --//
        let result = [...vanityNumbers].join(', ');
        let [item1, item2, item3] = [...vanityNumbers];
        textToSpeech = result.length > 11 ? [item1, item2, item3].join() : 'No vanity numbers found';

        //-- Counter console.log, used in testing to check efficiency of Lambda --//
        console.log('Counter result:', `The step function was called ${counter} times`);
        await addToDB(phoneNumber, result);
        callback(null, {
            statusCode: 201,
            body: textToSpeech,
        })
        return result;

    } else if (!Object.keys(data)?.length < 1) {
        let [item1, item2, item3] = data?.Item?.vanityNumbers.split(',');
        textToSpeech = item1.length > 10 ? [item1, item2, item3].join() : 'No vanity numbers found';

        callback(null, {
            statusCode: 201,
            body: textToSpeech,
        });
        return data.Item.vanityNumbers;
    }
};

//-- Helper functions to addTo and getFrom DynamoDB table --//
function addToDB(requestId, data) {
    console.log('Add to DB called');
    const params = {
        TableName: 'VanityNumbers',
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
        TableName: 'VanityNumbers',
        Key: {
            'phoneNumber': requestId,
        }
    }
    return ddb.get(params).promise();
}