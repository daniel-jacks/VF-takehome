<div id="top"></div>

# Vanity-Generator

## About the Project
This project is built with Node.JS, and leverages AWS Lambda, DynamoDB, and Amazon Connect in order to allow users (or callers for our use case) to call the provided number, and be told what the best available vanity numbers are based on the U.S. number they are calling from. The Lambda calculating the vanity numbers is also connected to DynamoDB, and will save up to 5 of the vanity numbers the Lambda creates. <br />

I decided that "best" in terms of vanity numbers is how long the word is. I think having a number that reads "1-800-testing" is a lot more memorable (and therefore better) than " 1-800-537-2cat". I built out the Lambda function according to this principle. <br /> 

The Lambda will start with the 7 digits following the area code (so if the input is "+18008378464", it would first consider "8378464"). Once it steps over all the possible words with those 7 digits, it will move the start point one to the right, and consider those 6 digits. This will continue until one of two things happen: 
1. The Lambda produces 5 possible vanity numbers ___or___
2. The input string is less than 4 digits long
(This goes back to what my idea of the "best" vanity numbers is; I think any word that is 3 characters long, or less, is not that memorable.) <br />

The strings that the Lambda produce are checked against a [word list](https://www.npmjs.com/package/wordlist-english) of ~275000 words, and if the string is included in this list, it will be added to the vanity numbers array. This array will ultimately be returned to the caller in the form of text-to-speech via Amazon Connect.

<p align="right">(<a href="#top">back to top</a>)</p>

## Built With
### Application
- [Node.JS](https://nodejs.org/en/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/)
- [Amazon Connect](https://aws.amazon.com/pm/connect/)

### Testing 
- [Sinon](https://sinonjs.org/)
- [Chai](https://www.chaijs.com/)

### Framework
- [AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/#:~:text=The%20AWS%20Serverless%20Application%20Model,databases%2C%20and%20event%20source%20mappings.)

<p align="right">(<a href="#top">back to top</a>)</p>

## Getting Started
Since this application was built out with AWS SAM, you'll need to follow AWS's [instructions](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html) regarding getting set up to build and deploy from your machine. <br />

Once you've completed this step, you may run the following commands in order to interact with this code base: <br />

<hr />

__Installing Dependancies:__ 
```bash
cd vanity-generator/function
```
___then___
```bash
npm i
```
<hr />

__Run Tests Locally:__ 
```bash
cd vanity-generator/function
```
___then___
```bash
npm run test
```

<hr />

__Build and Deploy to AWS:__
```bash
cd vanity-generator
```
___then___
```bash
sam deploy --guided
```
___or___ (if you already have your samconfig.toml file configured)
```bash
sam deploy
```
`sam deploy --guided` &nbsp; will walk you through configuring your `samconfig.toml` file. This file will be responsible for your __AWS Stack__ (located in AWS CloudFormation), your provisioned __S3 bucket__, the __region__ where you are deploying to, the __IAM role__ associated to your Lambda function, and of course, the __Lambda function__ itself. 

<p align="right">(<a href="#top">back to top</a>)</p>

## Contact
Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/daniel-jacks/)!
<p align="right">(<a href="#top">back to top</a>)</p>

## Day to Day Tracker 

- Tuesday: Today was the first day working on this project. My biggest goal for EOD was getting a better understanding of how to interact with Amazon Connect, setting up my local environment in order to make building this as straightforward as possible, and finally, to have a UML laid out for me to reference going into the week (and make adjustments as I see fit). 

- Wednesday: Today my plan was to work a bit on the function I wanted to use in order to convert the numbers into vanity numbers. This ended up taking a bit longer than anticipated, but I got the function working. I also ended up getting locked out of my AWS management account, and took just about all day to resolve that due to how strict AWS is about MFA and their security measures.

- Thursday: Today I touched back on the function for the vanity numbers, and also did a bit more research into how I want to connect all the different AWS services. My AWS account is still locked out and I guess I will be granted access tonight. My big goal for tomorrow is to get the AWS services up and running and accepting calls and potentially saving numbers (not necessarily vanity numbers) to the DynamoDB instance. From there I will work on the efficiency of the Lambda as well as tightening up anything else over the weekend and at the start of the week. 

- Friday: Capping off the week I think today went very well. I ended up getting the function working on AWS and was able to call in to my Amazon Connect account, which triggered the Lambda function and saved data in the DynamoDB instance. Unfortunately, I was promptly hung up on (don't have the Contact Flow set up yet), and my phone number can't make any vanity numbers. But, it did trigger the Lambda function AND saved an empty object in the DynamoDB table! Very good way to finish up the week, and glad the AWS MFA account issues didn't set me too far behind from where I wanted to be. 

- Saturday: This day was spent working a bit on the function and getting a better idea of how it would integrate with Amazon Connect properly. I realized that to make the Amazon Connect Contact Flow as simple as possible, I would want to be checking the database for vanity numbers first thing, and if that didn't return a result, I would want to create the vanity numbers and then put them in the DynamoDB table. I created a loop within Amazon Connect, to continue and try and get from the DynamoDB table, and added a prompt that acts as a buffer between the function invocations. 

- Sunday: First day I got the function working and returning with Amazon Connect properly!! The function is now saving to the DynamoDB table simply by calling the Amazon Connect number I have reserved, as well as reading back the numbers to the caller! A big sticking point I ran into today, is that the Lambda (at least how mine is configured) isn't the fastest in the world. I ended up narrowing down the vanity word length to 4, to save time when running the function from AWS Lambda. Since I got a minimum viable product on Sunday, my goal was to cover testing and documentation for the majority of Monday. That is until I had an idea regarding how to get the Lambda to be more efficient, which I would write down and try and implement on Monday.

- Monday: Big big day, had my note written down that read "use array.find() with regex, in order to be able to match beginning of words, and ultimately find longer words with less function calls". My idea that I had the night prior was this: why waste time and memory checking __all__ the outcomes of a 7 digit number, when I could just check if there was a word in the word-list that even _started_ with my current string. I ended up implementing this and cut out 99% of the extra workload the function was sifting through. The find method using regex acts as another base case for the step function being called. I used a counter to calculate just how much more efficient the function was, with the total number of invocations before the find method being 10593, and the total number after at just 143 on the same input. I spent the rest of the day cleaning up the function and commenting to help make it more readable, as well as building out three integration tests to check if my function was properly trying to get and put to the DynamoDB table. 

- Tuesday: 

<p align="right">(<a href="#top">back to top</a>)</p>
