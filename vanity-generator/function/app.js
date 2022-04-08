// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

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

const fs = require('fs');
const wordListPath = require('word-list');
const wordList = fs.readFileSync(wordListPath, 'utf8').split('\n');
exports.lambdaHandler = async (event, context) => {

    let fullInput = event.Details.ContactData.CustomerEndpoint.Address.substring(5);
    console.log('7 numbers', fullInput);
    let firstHalf = event.Details.ContactData.CustomerEndpoint.Address.substring(5, 8);
    console.log('first 3 numbers', firstHalf);
    let secondHalf = event.Details.ContactData.CustomerEndpoint.Address.substring(8);
    console.log('last 4 numbers', secondHalf);

    let options = [[], ['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i'], ['j', 'k', 'l'], ['m', 'n', 'o'], ['p', 'q', 'r', 's'], ['t', 'u', 'v'], ['w', 'x', 'y', 'z']];
    let numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let finalArr = new Set();

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
                if (wordList.includes(strAdd)) finalArr.add(`${tracker} ${strAdd}`);
                walk(string, tracker, strAdd, nextIdx);
            })
        }
    }

    // for (let i = 0; i < input.length; i += 1) {
    //     let strArr = input.split('');
    //     let subString = strArr.splice(i).join('');
    //     walk(subString, i)
    // }

    walk(fullInput, 0);
    walk(firstHalf, 1);
    walk(secondHalf, 2);

    let result = [...finalArr].join(', ');

    try {
        // const ret = await axios(url);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: result,
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};