/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
'use strict';

const Helper = require('hubot-test-helper');
const helper = new Helper('../src/scripts');

const expect = require('chai').expect;

// configure i18n with location of strings
var i18n = new (require('i18n-2'))({
	locales: ['en'],
	extension: '.json',
	defaultLocale: 'en',
	directory: __dirname + '/../src/locales',

	// Prevent messages file from being overwritten in error conditions (like poor JSON).
	updateFiles: false
});
i18n.setLocale('en');


// Passing arrow functions to mocha is discouraged: https://mochajs.org/#arrow-functions
// return promises from mocha tests rather than calling done() - http://tobyho.com/2015/12/16/mocha-with-promises/
describe('Interacting with Twitter Monitoring via Reg Ex', function() {

	let room;

	beforeEach(function() {
		room = helper.createRoom();
		// Force all emits into a reply.
		room.robot.on('ibmcloud.formatter', function(event) {
			if (event.message) {
				event.response.reply(event.message);
			}
			else {
				event.response.send({attachments: event.attachments});
			}
		});

		process.env.HUBOT_TWEETER_ACCOUNTS = '{"hubot": {"access_token": "foo", "access_token_secret": "bar"}}';
		room.robot.brain.set('bm.twitter.username', 'hubot');
		// enable all events
		return room.user.say('mimiron', '@hubot twitter monitoring edit events').then(() => {
			return room.user.say('mimiron', 'enable 1 2 3');
		});
	});

	afterEach(function() {
		room.destroy();
	});

	// ------------------------------------------------------
	// Test: help
	// ------------------------------------------------------
	context('user calls `help`', function() {
		it('should respond with message about what the script can do', function() {
			return room.user.say('mimiron', '@hubot twitter monitoring help').then(() => {
				let response = room.messages[room.messages.length - 1];
				let expectedResponse = room.robot.name + ' twitter monitoring enable - ' + i18n.__('help.events.twitter.enable') + '\n'
					+ room.robot.name + ' twitter monitoring disable - ' + i18n.__('Disables the ability to post tweets.') + '\n'
					+ room.robot.name + ' twitter monitoring edit tweets - ' + i18n.__('help.events.twitter.tweet.edit') + '\n'
					+ room.robot.name + ' twitter monitoring list tweets - ' + i18n.__('help.events.twitter.tweet.list') + '\n'
					+ room.robot.name + ' twitter monitoring edit events - ' + i18n.__('help.events.twitter.event.edit') + '\n';
				expect(response).to.eql(['hubot', '@mimiron \n' + expectedResponse]);
			});
		});
	});

	// ------------------------------------------------------
	// Test: enable twitter monitoring
	// ------------------------------------------------------
	context('user calls `enable twitter monitoring`', function() {
		it('should respond with message about what it is enabling', function() {
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = 'false';
			return room.user.say('mimiron', '@hubot twitter monitoring enable').then(() => {
				let response = room.messages[room.messages.length - 3];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.edit.tweet.instructions', 'twitter monitoring edit tweets')]);
				response = room.messages[room.messages.length - 2];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.edit.event.instructions', 'twitter monitoring edit events')]);
			});
		});
	});

	// ----------------------------------------------------------------
	// Test conversation flow when there are multiple twitter accounts
	// ----------------------------------------------------------------
	context('user calls `enable twitter monitoring, and there are multiple user accounts`', function() {
		it('should respond with message that we need to choose one of the accounts', function() {
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = 'false';
			process.env.HUBOT_TWEETER_ACCOUNTS = '{"hubot": {"access_token": "foo", "access_token_secret": "bar"}, "bluebot": {"access_token": "foo", "access_token_secret": "bar"}}';
			return room.user.say('mimiron', '@hubot twitter monitoring enable').then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.set.username.prompt') + '\n1. hubot\n2. bluebot']);
				return room.user.say('mimiron', '@hubot 2');
			}).then(() => {
				expect(room.robot.brain.get('bm.twitter.username')).to.eql('bluebot');
			});
		});
	});

	// ----------------------------------------------------------------------------------------------------------
	// Test conversation flow when there are multiple twitter accounts, and the user quits out before selecting
	// ----------------------------------------------------------------------------------------------------------
	context('user calls `enable twitter monitoring, and there are multiple user accounts, but user quits conversation`', function() {
		it('should respond with message that something went wrong', function() {
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = 'false';
			process.env.HUBOT_TWEETER_ACCOUNTS = '{"hubot": {"access_token": "foo", "access_token_secret": "bar"}, "bluebot": {"access_token": "foo", "access_token_secret": "bar"}}';
			return room.user.say('mimiron', '@hubot twitter monitoring enable').then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.set.username.prompt') + '\n1. hubot\n2. bluebot']);
				return room.user.say('mimiron', '@hubot exit');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.set.username.failure')]);
			});
		});
	});

	// ------------------------------------------------------
	// Test redundant enable of twitter monitoring
	// ------------------------------------------------------
	context('user calls `enable twitter monitoring`', function() {
		it('should respond with message that it is already enabled', function() {
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = 'true';
			return room.user.say('mimiron', '@hubot twitter monitoring enable').then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.monitoring.already')]);
			});
		});
	});

	// ------------------------------------------------------
	// Test: disable twitter monitoring
	// ------------------------------------------------------
	context('user calls `disable twitter monitoring`', function() {
		it('should respond with message about what it is disabling', function() {
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = 'true';
			return room.user.say('mimiron', '@hubot twitter monitoring disable').then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.monitoring.disabled')]);
			});
		});
	});

	// ------------------------------------------------------
	// Test: redundant disable twitter monitoring
	// ------------------------------------------------------
	context('user calls `disable twitter monitoring`', function() {
		it('should respond with message that it is already disabled', function() {
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = 'false';
			return room.user.say('mimiron', '@hubot twitter monitoring disable').then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.monitoring.nothing')]);
			});
		});
	});

	// ------------------------------------------------------
	// Test: edit tweets
	// ------------------------------------------------------
	context('user calls `twitter monitoring edit tweets`', function() {
		it('should respond with message about editing tweets', function() {
			return room.user.say('mimiron', '@hubot twitter monitoring edit tweets').then(() => {
				let response = room.messages[room.messages.length - 2];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.edit.tweets.prompt')]);
				response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron \n'
					+ '1. `App Scale`: ' + i18n.__('events.twitter.app.scaling.message') + '\n'
					+ '2. `App Downtime`: ' + i18n.__('events.twitter.app.downtime.message') + '\n'
					+ '3. `GitHub Deploy`: ' + i18n.__('events.twitter.github.deploy.message')]);
				return room.user.say('mimiron', '@hubot 1');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.message.prompt')]);
				return room.user.say('mimiron', '@hubot Our bot rocks!');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.message.new', 'Our bot rocks!')]);
			});
		});
	});

	// ------------------------------------------------------
	// Test: edit events - enable
	// ------------------------------------------------------
	context('user calls `twitter monitoring edit events`', function() {
		it('should respond with message about editing events, and we enable one of them', function() {
			return room.user.say('mimiron', '@hubot twitter monitoring edit events').then(() => {
				return room.user.say('mimiron', '@hubot enable 1, 15');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.edit.events.enable.ok', i18n.__('events.twitter.app.scaling.title'))]);
			});
		});
	});

	// ------------------------------------------------------
	// Test: edit events - disable
	// ------------------------------------------------------
	context('user calls `twitter monitoring edit events`', function() {
		it('should respond with message about editing events, and we disable one of them', function() {
			return room.user.say('mimiron', '@hubot twitter monitoring edit events').then(() => {
				return room.user.say('mimiron', '@hubot disable 1');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('events.twitter.edit.events.disable.ok', i18n.__('events.twitter.app.scaling.title'))]);
				return room.user.say('mimiron', '@hubot twitter monitoring list tweets');
			});
		});
	});

	// ------------------------------------------------------
	// Test: list tweets
	// ------------------------------------------------------
	context('user calls `twitter monitoring list tweets`', function() {
		it('should create a list of tweets.', function(done) {
			room.robot.on('ibmcloud.formatter', function(event) {
				expect(event.attachments.length).to.eql(3);
				expect(event.attachments[0].text).to.eql(i18n.__('Our bot rocks!'));
				expect(event.attachments[0].title).to.eql(i18n.__('events.twitter.app.scaling.title'));
				expect(event.attachments[1].text).to.eql(i18n.__('events.twitter.app.downtime.message'));
				expect(event.attachments[1].title).to.eql(i18n.__('events.twitter.app.downtime.title'));
				expect(event.attachments[2].text).to.eql(i18n.__('events.twitter.github.deploy.message'));
				expect(event.attachments[2].title).to.eql(i18n.__('events.twitter.github.deploy.title'));
				done();
			});
			room.user.say('mimiron', '@hubot twitter monitoring list tweets').then();
		});
	});

	// ------------------------------------------------------
	// Test: handle emitted crash activity
	// ------------------------------------------------------
	context('internal crash activity emitted', function() {
		it('should detect new tweet.', function(done) {
			room.robot.on('hubot-tweeter.tweet', function(evnt) {
				expect(evnt.msg).to.eql('crash message 2');
				expect(evnt.tweet).to.eql(i18n.__('events.twitter.app.downtime.message'));
				expect(evnt.username).to.eql('hubot');
				done();
			});
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = false;
			room.robot.emit('bot.activity', {activity_id: 'activity.app.crash', robot_res: 'crash message 0'});
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = true;
			room.robot.emit('bot.activity', {no_activity_id: 'test', robot_res: 'crash message 1'});
			room.robot.emit('bot.activity', {activity_id: 'activity.new', robot_res: 'new activity'});
			room.robot.emit('bot.activity', {activity_id: 'activity.app.crash', robot_res: 'crash message 2'});
		});
	});

	// ------------------------------------------------------
	// Test: handle emitted scale activity
	// ------------------------------------------------------
	context('internal scale activity emitted', function() {
		it('should detect new tweet.', function(done) {
			room.robot.on('hubot-tweeter.tweet', function(evnt) {
				expect(evnt.msg).to.eql('scale message');
				expect(evnt.tweet).to.eql('Our bot rocks!');
				expect(evnt.username).to.eql('hubot');
				done();
			});
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = true;
			room.robot.emit('bot.activity', {activity_id: 'activity.app.scale', robot_res: 'scale message'});
		});
	});

	// ------------------------------------------------------
	// Test: handle emitted github deploy activity
	// ------------------------------------------------------
	context('internal github deploy activity emitted', function() {
		it('should detect new tweet.', function(done) {
			room.robot.on('hubot-tweeter.tweet', function(evnt) {
				expect(evnt.msg).to.eql('github deploy message');
				expect(evnt.tweet).to.eql(i18n.__('events.twitter.github.deploy.message'));
				expect(evnt.username).to.eql('hubot');
				done();
			});
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = true;
			room.robot.emit('bot.activity', {activity_id: 'activity.github.deploy', robot_res: 'github deploy message'});
		});
	});
});
