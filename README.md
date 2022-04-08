<div id="top"></div>
# VF-takehome

## About the Project
<p align="right">(<a href="#top">back to top</a>)</p>

## Built With
<p align="right">(<a href="#top">back to top</a>)</p>

## Getting Started
<p align="right">(<a href="#top">back to top</a>)</p>

### Prerequisites
<p align="right">(<a href="#top">back to top</a>)</p>

### Installation 
<p align="right">(<a href="#top">back to top</a>)</p>

## Contact
<p align="right">(<a href="#top">back to top</a>)</p>

## Day to Day Tracker 
<p align="right">(<a href="#top">back to top</a>)</p>

- Tuesday: Today was the first day working on this project. My biggest goal for EOD was getting a better understanding of how to interact with Amazon Connect, setting up my local environment in order to make building this as straightforward as possible, and finally, to have a UML laid out for me to reference going into the week (and make adjustments as I see fit). 

- Wednesday: Today my plan was to work a bit on the function I wanted to use in order to convert the numbers into vanity numbers. This ended up taking a bit longer than anticipated, but I got the function working. I also ended up getting locked out of my AWS management account, and took just about all day to resolve that due to how strict AWS is about MFA and their security measures.

- Thursday: Today I touched back on the function for the vanity numbers, and also did a bit more research into how I want to connect all the different AWS services. My AWS account is still locked out and I guess I will be granted access tonight. My big goal for tomorrow is to get the AWS services up and running and accepting calls and potentially saving numbers (not necessarily vanity numbers) to the DynamoDB instance. From there I will work on the efficiency of the Lambda as well as tightening up anything else over the weekend and at the start of the week. 

- Friday: Capping off the week I think today went very well. I ended up getting the function working on AWS and was able to call in to my Amazon Connect account, which triggered the Lambda function and saved data in the DynamoDB instance. Unfortunately, I was promptly hung up on (don't have the Contact Flow set up yet), and my phone number can't make any vanity numbers. But, it did trigger the Lambda function AND saved an empty object in the DynamoDB table! Very good way to finish up the week, and glad the AWS MFA account issues didn't set me too far behind where I wanted to be. 