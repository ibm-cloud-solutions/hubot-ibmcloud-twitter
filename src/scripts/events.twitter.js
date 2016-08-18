// Description:
//  Provides Twitter integration for Bluemix actions
//
// Configuration:
//  HUBOT_TWITTER_CONSUMER_KEY
//  HUBOT_TWITTER_CONSUMER_SECRET
//  HUBOT_TWEETER_ACCOUNTS
//
// Commands:
//   hubot twitter monitoring help - Show available commands in the twitter monitoring category.
//
// Author:
//  cehannig
/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2016. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
'use strict';

var path = require('path');
var TAG = path.basename(__filename);

// requires
const Conversation = require('hubot-conversation');
const utils = require('hubot-ibmcloud-utils').utils;
const palette = require('hubot-ibmcloud-utils').palette;
const activity = require('hubot-ibmcloud-activity-emitter');
var i18n = new (require('i18n-2'))({
	locales: ['en'],
	extension: '.json',
	defaultLocale: 'en',
	directory: __dirname + '/../locales',

	// Prevent messages file from being overwritten in error conditions (like poor JSON).
	updateFiles: false
});
i18n.setLocale('en');

// commands
const TWITTER_HELP = /twitter\s+monitoring\s+help/i;
const ENABLE_MONITORING = /twitter\s+monitoring\s+(enable|start)/i;
const DISABLE_MONITORING = /twitter\s+monitoring\s+(disable|stop)/i;
const EDIT_TWEETS = /twitter\s+monitoring\s+(edit|change)\s*(tweets)/i;
const LIST_TWEETS = /twitter\s+monitoring\s+(list|show)\s*(tweets)/i;
const EDIT_EVENTS = /twitter\s+monitoring\s+(edit|update)\s*(events)/i;

// conversation regex
const EDIT_EVENTS_CONVO = /(enable|disable)\s*((\d+,?\s*)+)/i;

// brain constants
const BRAIN_TWITTER_USERNAME = 'bm.twitter.username';
const BRAIN_TWITTER_EVENTS = 'bm.twitter.events';

const TWEETER_EMIT_TWEET = 'hubot-tweeter.tweet';
const BOT_ACTIVITY = 'bot.activity';
const SCALE_EVENT = {
	type: 'activity.app.scale',
	title: i18n.__('events.twitter.app.scaling.title'),
	message: i18n.__('events.twitter.app.scaling.message'),
	enabled: false
};
const CRASH_EVENT = {
	type: 'activity.app.crash',
	title: i18n.__('events.twitter.app.downtime.title'),
	message: i18n.__('events.twitter.app.downtime.message'),
	enabled: false
};
const GITHUB_DEPLOY = {
	type: 'activity.github.deploy',
	title: i18n.__('events.twitter.github.deploy.title'),
	message: i18n.__('events.twitter.github.deploy.message'),
	enabled: false
};
const EVENTS_ARRAY = [SCALE_EVENT, CRASH_EVENT, GITHUB_DEPLOY];

module.exports = (robot) => {

	const switchBoard = new Conversation(robot);

	robot.on('twitter.monitoring.help', (res) => {
		robot.logger.debug(`${TAG}: twitter.monitoring.help Natural Language match.`);
		help(res);
	});
	robot.respond(TWITTER_HELP, {id: 'twitter.monitoring.help'}, (res) => {
		robot.logger.debug(`${TAG}: twitter.monitoring.help Reg Ex match.`);
		help(res);
	});
	function help(res) {
		robot.logger.debug(`${TAG}: twitter.help res.message.text=${res.message.text}.`);
		robot.logger.info(`${TAG}: Listing help twitter...`);
		//   hubot twitter monitoring enable - Enables the ability to post tweets.
		//   hubot twitter monitoring disable - Disables the ability to post tweets.
		//   hubot twitter monitoring edit tweets - Allows user to edit what the bot will post based on action received.
		//   hubot twitter monitoring list tweets - Shows the list of bluemix events the bot can react to, and post the message associated with the action.
		//	 hubot twitter monitoring edit events - Allows user to edit which events the bot will post about.

		const help = robot.name + ' twitter monitoring enable - ' + i18n.__('help.events.twitter.enable') + '\n'
			+ robot.name + ' twitter monitoring disable - ' + i18n.__('Disables the ability to post tweets.') + '\n'
			+ robot.name + ' twitter monitoring edit tweets - ' + i18n.__('help.events.twitter.tweet.edit') + '\n'
			+ robot.name + ' twitter monitoring list tweets - ' + i18n.__('help.events.twitter.tweet.list') + '\n'
			+ robot.name + ' twitter monitoring edit events - ' + i18n.__('help.events.twitter.event.edit') + '\n';
		robot.emit('ibmcloud.formatter', { response: res, message: '\n' + help});
	};

	// respond to enable twitter monitoring
	robot.on('twitter.monitoring.enable', (res) => {
		robot.logger.debug(`${TAG}: twitter.monitoring.enable Natural Language match.`);
		enableMonitoring(res);
	});
	robot.respond(ENABLE_MONITORING, {id: 'twitter.monitoring.enable'}, (res) => {
		robot.logger.debug(`${TAG}: twitter.monitoring.enable Reg Ex match.`);
		enableMonitoring(res);
	});
	function enableMonitoring(res) {
		robot.logger.debug(`${TAG}: twitter.monitoring.enable res.message.text=${res.message.text}.`);
		robot.logger.info(`${TAG}: Enabling twitter monitoring...`);
		// check if monitoring is already
		if (process.env.HUBOT_TWITTER_MONITORING_ENABLED === 'true') {
			let message = i18n.__('events.twitter.monitoring.already');
			robot.emit('ibmcloud.formatter', { response: res, message: message});
			return;
		}
		process.env.HUBOT_TWITTER_MONITORING_ENABLED = true;

		setUsernameConvo(res).then((success) => {
			let message = i18n.__('events.twitter.monitoring.confirmation', robot.brain.get(BRAIN_TWITTER_USERNAME));
			robot.emit('ibmcloud.formatter', { response: res, message: message});
			message = i18n.__('events.twitter.edit.tweet.instructions', 'twitter monitoring edit tweets');
			robot.emit('ibmcloud.formatter', { response: res, message: message});
			message = i18n.__('events.twitter.edit.event.instructions', 'twitter monitoring edit events');
			robot.emit('ibmcloud.formatter', { response: res, message: message});
			displayTweetsAsAttachments(robot, res, EVENTS_ARRAY.filter(evnt => evnt.enabled));
		}).catch((err) => {
			robot.logger.error(`${TAG}: An error occurred enabling twitter montioring.`);
			robot.logger.error(err);
			let message = i18n.__('events.twitter.set.username.failure');
			robot.emit('ibmcloud.formatter', { response: res, message: message});
		});
	};

	robot.on('twitter.monitoring.disable', (res) => {
		robot.logger.debug(`${TAG}: twitter.monitoring.disable Natural Language match.`);
		disableMonitoring(res);
	});
	robot.respond(DISABLE_MONITORING, {id: 'twitter.monitoring.disable'}, (res) => {
		robot.logger.debug(`${TAG}: twitter.monitoring.disable Reg Ex match.`);
		disableMonitoring(res);
	});
	function disableMonitoring(res) {
		robot.logger.debug(`${TAG}: twitter.monitoring.disable res.message.text=${res.message.text}.`);
		robot.logger.info(`${TAG}: Disable twitter montioring...`);
		// check if monitoring is already disabled
		if (process.env.HUBOT_TWITTER_MONITORING_ENABLED === 'false') {
			let message = i18n.__('events.twitter.monitoring.nothing');
			robot.emit('ibmcloud.formatter', { response: res, message: message});
			return;
		}
		let message = i18n.__('events.twitter.monitoring.disabled');
		robot.emit('ibmcloud.formatter', { response: res, message: message});
		process.env.HUBOT_TWITTER_MONITORING_ENABLED = false;
	};

	robot.on('twitter.tweet.edit', (res) => {
		robot.logger.debug(`${TAG}: twitter.tweet.edit Natural Language match.`);
		editTweets(res);
	});
	robot.respond(EDIT_TWEETS, {id: 'twitter.tweet.edit'}, (res) => {
		robot.logger.debug(`${TAG}: twitter.tweet.edit Reg Ex match.`);
		editTweets(res);
	});
	function editTweets(res) {
		robot.logger.debug(`${TAG}: twitter.tweet.edit res.message.text=${res.message.text}.`);
		robot.logger.info(`${TAG}: Edit a tweet...`);
		const regex = utils.generateRegExpForNumberedList(EVENTS_ARRAY.length);
		let prompt = '';
		let selection;
		let editPrompt;
		let evnt;

		let message = i18n.__('events.twitter.edit.tweets.prompt');
		robot.emit('ibmcloud.formatter', { response: res, message: message});
		EVENTS_ARRAY.map((evnt, index) => {
			prompt += `\n${index + 1}. \`${evnt.title}\`: ${evnt.message}`;
		});

		utils.getExpectedResponse(res, robot, switchBoard, prompt, regex).then((selectionRes) => {
			selection = parseInt(selectionRes.match[1], 10);
			evnt = EVENTS_ARRAY[selection - 1];
			robot.logger.info(`${TAG}: Edit message for ${evnt.title}.`);
			editPrompt = i18n.__('events.twitter.message.prompt');
			utils.getExpectedResponse(res, robot, switchBoard, editPrompt, /(.*)/i).then((response) => {
				let message = i18n.__('events.twitter.message.new', response.match[1]);
				robot.emit('ibmcloud.formatter', { response: res, message: message});
				evnt.message = response.match[1];
				robot.logger.info(`${TAG}: New message for ${evnt.title} will be ${evnt.message}.`);
				// store updated event list in brain
				robot.brain.set(BRAIN_TWITTER_EVENTS, EVENTS_ARRAY);
			});
		});
	}

	robot.on('twitter.tweet.list', (res) => {
		robot.logger.debug(`${TAG}: twitter.tweet.list Natural Language match.`);
		listTweets(res);
	});
	robot.respond(LIST_TWEETS, {id: 'twitter.tweet.list'}, (res) => {
		robot.logger.debug(`${TAG}: twitter.tweet.list Reg Ex match.`);
		listTweets(res);
	});
	function listTweets(res) {
		robot.logger.debug(`${TAG}: twitter.tweet.list res.message.text=${res.message.text}.`);
		robot.logger.info(`${TAG}: Listing tweets...`);
		displayTweetsAsAttachments(robot, res, EVENTS_ARRAY);
	};

	robot.on('twitter.event.list', (res) => {
		robot.logger.debug(`${TAG}: twitter.event.list Natural Language match.`);
		editTweetList(res);
	});
	robot.respond(EDIT_EVENTS, {id: 'twitter.event.list'}, (res) => {
		robot.logger.debug(`${TAG}: twitter.event.list Reg Ex match.`);
		editTweetList(res);
	});
	function editTweetList(res) {
		robot.logger.debug(`${TAG}: twitter.event.list res.message.text=${res.message.text}.`);
		robot.logger.info(`${TAG}: Listing twitter events...`);
		const regex = new RegExp(EDIT_EVENTS_CONVO);
		let prompt = i18n.__('events.twitter.edit.events.prompt', '\'enable 1,2,3\' or \'disable 1 2\'');
		let selections;
		let cleanInput;
		let eventList;

		EVENTS_ARRAY.map((evnt, index) => {
			prompt += `\n${index + 1}. \`${evnt.title}\`: ${evnt.message}`;
		});

		utils.getExpectedResponse(res, robot, switchBoard, prompt, regex, switchBoard).then((selectionRes) => {
			selections = selectionRes.match[2].split(new RegExp(' |,'));
			cleanInput = cleanEventInput(selections, 1, EVENTS_ARRAY.length);
			eventList = indicesToEventNames(cleanInput);
			let message;

			switch (selectionRes.match[1]) {
			case 'enable':
				message = i18n.__('events.twitter.edit.events.enable.ok', eventList);
				robot.emit('ibmcloud.formatter', { response: res, message: message});
				setEnabledFlag(cleanInput, true);
				break;
			case 'disable':
				message = i18n.__('events.twitter.edit.events.disable.ok', eventList);
				robot.emit('ibmcloud.formatter', { response: res, message: message});
				setEnabledFlag(cleanInput, false);
				break;
			/* istanbul ignore next: cannot reach this case */
			default:
				robot.logger.error(`${TAG}: Unknown case neither enable or disable.`);
			}

			// store updated event list in brain
			robot.brain.set(BRAIN_TWITTER_EVENTS, EVENTS_ARRAY);
		});
	};

	robot.on(BOT_ACTIVITY, (payload) => {
		if (process.env.HUBOT_TWITTER_MONITORING_ENABLED === 'false') {
			return;
		}
		// For when we decide to use some of these variables
		// const app_name = payload.app_name;
		// const app_guid = payload.app_guid;
		// const space_name = payload.space_name;
		// const space_guid = payload.space_guid;
		const activity_id = payload.activity_id;
		const robot_res = payload.robot_res;

		if (activity_id === null || !activity_id) {
			robot.logger.error(`${TAG}: Activity ID was not supplied in bot activity payload.`);
			return;
		}

		let twitterObj = {
			msg: robot_res,
			username: robot.brain.get(BRAIN_TWITTER_USERNAME)
		};

		for (let index = 0; index < EVENTS_ARRAY.length; index++) {
			let evnt = EVENTS_ARRAY[index];
			if (evnt.enabled && evnt.type === activity_id) {
				twitterObj.tweet = evnt.message;
				robot.emit(TWEETER_EMIT_TWEET, twitterObj);
				robot.logger.debug(`${TAG}: tweeting event message ${evnt.message} for user ${twitterObj.username}.`);

				/* istanbul ignore else  */
				if (activity_id !== 'activity.events.twitter') {
					// in here to prevent possible regression.
					activity.emitBotActivity(robot, robot_res, {activity_id: 'activity.events.twitter'});
				}
				break;
			}
		}
	});

	function displayTweetsAsAttachments(robot, res, arr) {
		const attachments = arr.map((obj) => {
			const attachment = {
				title: obj.title,
				text: obj.message,
				color: obj.enabled ? palette.positive : palette.normal
			};
			return attachment;
		});

		// Emit the app status as an attachment
		robot.emit('ibmcloud.formatter', {
			response: res,
			attachments
		});
	};

	function cleanEventInput(arr, min, max) {
		let eventIndex;

		return arr.filter((n) => {
			if (n === '') {
				return;
			}
			eventIndex = parseInt(n, 10);

			return eventIndex >= min && eventIndex <= max;
		});
	};

	// converts an array of indices that maps to the list of events
	// into a human readable list.
	function indicesToEventNames(arr) {
		const arrLength = arr.length;
		let eventList = '';
		let eventType;
		let eventIndex;

		if (arrLength === 1) {
			eventIndex = parseInt(arr[0], 10) - 1;
			return EVENTS_ARRAY[eventIndex].title;
		}
		for (let i = 0; i < arrLength; i++) {
			eventIndex = parseInt(arr[i], 10) - 1;
			eventType = EVENTS_ARRAY[eventIndex].title;
			if (i === arrLength - 1) {
				eventList += `and ${eventType}`;
			}
			else if (i === arrLength - 2) {
				eventList += `${eventType} `;
			}
			else {
				eventList += `${eventType}, `;
			}
		}
		return eventList;
	};

	// retrieves usernames from env variable
	function getUsernames() {
		return Object.keys(JSON.parse(process.env.HUBOT_TWEETER_ACCOUNTS));
	};

	// provides conversation for setting a twitter username.
	// skips asking which username to use if only one exists.
	function setUsernameConvo(res) {
		return new Promise((resolve, reject) => {
			let prompt = i18n.__('events.twitter.set.username.prompt');
			let usernames = getUsernames();
			let regex = utils.generateRegExpForNumberedList(usernames.length);
			let selection;

			if (usernames && usernames.length === 1) {
				robot.brain.set(BRAIN_TWITTER_USERNAME, usernames[0]);
				return resolve();
			}

			usernames.map((username, index) => {
				prompt += `\n${index + 1}. ${username}`;
			});

			utils.getExpectedResponse(res, robot, switchBoard, prompt, regex).then((selectionRes) => {
				selection = parseInt(selectionRes.match[1], 10);
				robot.brain.set(BRAIN_TWITTER_USERNAME, usernames[selection - 1]);
				resolve();
			}).catch((err) => {
				reject(err);
			});
		});
	};

	// sets the enabled flag on the events array for the indices provided
	function setEnabledFlag(arr, enabled) {
		let eventNum;

		for (let index = 0; index < arr.length; index++) {
			eventNum = parseInt(arr[index], 10);
			/* istanbul ignore else  */
			if (eventNum > 0 && eventNum <= EVENTS_ARRAY.length) {
				EVENTS_ARRAY[eventNum - 1].enabled = enabled;
			}
		}
	};
};
