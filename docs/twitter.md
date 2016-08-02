# Twitter Integration

If you plan to integrate Twitter Monitoring into your bot, please follow these steps.

## Gather your Credentials

- Go to [Twitter's dev page](https://dev.twitter.com/), and sign up using your Twitter account
- Go to [Twitter App Management](https://apps.twitter.com/), and fill out the form for creating a new app.
![Create New App](/docs/images/Twitter_Application_Management.png)
- Go to the `Keys and Access Tokens` tab
![Keys and Access Tokens](/docs/images/Twitter_Keys_and_Access_Tokens_Tab.png)
- Scroll to the bottom of the page and select the `Create my access token` button.
![Keys and Access Tokens](/docs/images/Twitter_Token_Action_Button.png)
- Now you have all you need to start using Twitter Monitoring
    + Consumer Keys
    ![Consumer Keys](/docs/images/Twitter_Consumer_Keys.png)
    + Access Token Keys
    ![Access Token Keys](/docs/images/Twitter_Access_Tokens.png)

### Provisioning Configuration

In order to provision your bot on Bluemix to use Twitter Monitoring you will need to supply the `HUBOT_TWITTER_CONSUMER_KEY`, `HUBOT_TWITTER_CONSUMER_SECRET`, `HUBOT_TWEETER_ACCOUNTS` information obtained from the above section into the configuration wizard. `HUBOT_TWEETER_ACCOUNTS` is a JSON object that consists of three parts; Twitter username, access token, and access token secret. See the __Provisioning on Bluemix__ section of the [README.md](../../README.md) for more information.

### Development Configuration

Take the Twitter values obtained in the previous section and append to the end of `config/env`:
```
export HUBOT_TWITTER_CONSUMER_KEY=xx
export HUBOT_TWITTER_CONSUMER_SECRET=xx
export HUBOT_TWEETER_ACCOUNTS=xx
```

HUBOT_TWEETER_ACCOUNTS

```
{
    "USERNAME": {
        "access_token":"ACCESS_TOKEN",
        "access_token_secret":"ACCESS_TOKEN_SECRET"
    }
}
```

#### Help

To see what this integration offers just ask hubot, `@hubot twitter monitoring help`.
