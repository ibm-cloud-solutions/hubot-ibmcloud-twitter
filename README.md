[![Build Status](https://travis-ci.org/ibm-cloud-solutions/hubot-ibmcloud-twitter.svg?branch=master)](https://travis-ci.org/ibm-cloud-solutions/hubot-ibmcloud-twitter)
[![Coverage Status](https://coveralls.io/repos/github/ibm-cloud-solutions/hubot-ibmcloud-twitter/badge.svg?branch=cleanup)](https://coveralls.io/github/ibm-cloud-solutions/hubot-ibmcloud-twitter?branch=master)
[![Dependency Status](https://dependencyci.com/github/ibm-cloud-solutions/hubot-ibmcloud-twitter/badge)](https://dependencyci.com/github/ibm-cloud-solutions/hubot-ibmcloud-twitter)
[![npm](https://img.shields.io/npm/v/hubot-ibmcloud-twitter.svg?maxAge=2592000)](https://www.npmjs.com/package/hubot-ibmcloud-twitter)

# hubot-ibmcloud-twitter

A hubot script for automated tweeting based on events on the IBM Cloud.

## Getting Started
* [Usage](#usage)
* [Commands](#commands)
* [Hubot Adapter Setup](#hubot-adapter-setup)
* [Development](#development)
* [License](#license)
* [Contribute](#contribute)

## Usage

Steps for adding this to your existing hubot:

1. `cd` into your hubot directory
2. Install the Twitter functionality with `npm install hubot-ibmcloud-twitter --save`
3. Add `hubot-ibmcloud-twitter` to your `external-scripts.json`
4. Add the necessary environment variables:
```
HUBOT_TWITTER_CONSUMER_KEY=<Twitter Consumer Key>
HUBOT_TWITTER_CONSUMER_SECRET=<Twitter Consumer Secret>
HUBOT_TWEETER_ACCOUNTS=<Please see below>
```
  Note: `HUBOT_TWEETER_ACCOUNTS` is a JSON Object.
```
{
    "USERNAME": {
        "access_token":"ACCESS_TOKEN",
        "access_token_secret":"ACCESS_TOKEN_SECRET"
    }
}
```
5. Start up your bot & off to the races!

## Commands
- edit tweets, list tweets, edit events, enable/disable
- `hubot twitter monitoring help` - Show available commands in the twitter monitoring category.
- `hubot twitter monitoring enable|disable` - Enable|Disable automatic tweeting.
- `hubot twitter monitoring list tweets` - Show the list of events and their associated tweets.
- `hubot twitter monitoring edit tweets` - Edit the tweet for a given event.
- `hubot twitter monitoring edit events` - Edit which events we will tweet about.

## Hubot Adapter Setup

Hubot supports a variety of adapters to connect to popular chat clients.  For more feature rich experiences you can setup the following adapters:
- [Slack setup](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-twitter/blob/master/docs/adapters/slack.md)
- [Facebook Messenger setup](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-twitter/blob/master/docs/adapters/facebook.md)

## Development

Please refer to the [CONTRIBUTING.md](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-twitter/blob/master/CONTRIBUTING.md) before starting any work.  Steps for running this script for development purposes:

### Configuration Setup

1. Create `config` folder in root of this project.
2. Create `env` in the `config` folder, with the following contents:
```
HUBOT_TWITTER_CONSUMER_KEY=<Twitter Consumer Key>
HUBOT_TWITTER_CONSUMER_SECRET=<Twitter Consumer Secret>
HUBOT_TWEETER_ACCOUNTS=<Please see below>
```
  Note: `HUBOT_TWEETER_ACCOUNTS` is a JSON Object.
```
{
    "USERNAME": {
        "access_token":"ACCESS_TOKEN",
        "access_token_secret":"ACCESS_TOKEN_SECRET"
    }
}
```
3. In order to view content in chat clients you will need to add `hubot-ibmcloud-formatter` to your `external-scripts.json` file. Additionally, if you want to use `hubot-help` to make sure your command documentation is correct.  Create `external-scripts.json` in the root of this project, with the following contents:
```
[
    "hubot-help",
    "hubot-ibmcloud-formatter"
]
```
4. Lastly, run `npm install` to obtain all the dependent node modules.

### Running Hubot with Adapters

Hubot supports a variety of adapters to connect to popular chat clients.

If you just want to use:
 - Terminal: run `npm run start`
 - [Slack: link to setup instructions](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-twitter/blob/master/docs/adapters/slack.md)
 - [Facebook Messenger: link to setup instructions](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-twitter/blob/master/docs/adapters/facebook.md)

## License

See [LICENSE.txt](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-twitter/blob/master/LICENSE.txt) for license information.

## Contribute <a id="contribute"></a>

Please check out our [Contribution Guidelines](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-twitter/blob/master/CONTRIBUTING.md) for detailed information on how you can lend a hand.
