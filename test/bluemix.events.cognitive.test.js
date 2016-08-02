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
describe('Interacting with Twitter Monitoring via Natural Language', function() {

	let room;

	beforeEach(function() {
		room = helper.createRoom();

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
		it('should respond with message about what the script can do', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain('twitter monitoring edit tweets');
				expect(event.message).to.contain('twitter monitoring list tweets');
				done();
			});

			var res = { message: {text: 'I want help with twitter monitoring', id: 'anId', user: {id: 'anId'}}, user: {id: 'anId'}, response: room, reply: function(){} };
			room.robot.emit('twitter.monitoring.help', res, {});
		});
	});

	// ------------------------------------------------------
	// Test: enable twitter monitoring
	// ------------------------------------------------------
	context('user calls `enable twitter monitoring`', function() {
		it('should respond with message about what it is enabling', function(done) {
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = 'false';
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('events.twitter.monitoring.confirmation', 'hubot'));
				done();
			});

			var res = { message: {text: 'start tweeting about my applications', id: 'anId', user: {id: 'anId'}}, user: {id: 'anId'}, response: room, reply: function(){} };
			room.robot.emit('twitter.monitoring.enable', res, {});
		});
	});


	// ------------------------------------------------------
	// Test redundant enable of twitter monitoring
	// ------------------------------------------------------
	context('user calls `enable twitter monitoring`', function() {
		it('should respond with message that it is already enabled', function(done) {
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = 'true';
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('events.twitter.monitoring.already'));
				done();
			});

			var res = { message: {text: 'start tweeting about my applications', id: 'anId', user: {id: 'anId'}}, user: {id: 'anId'}, response: room, reply: function(){} };
			room.robot.emit('twitter.monitoring.enable', res, {});
		});
	});

	// ------------------------------------------------------
	// Test: disable twitter monitoring
	// ------------------------------------------------------
	context('user calls `disable twitter monitoring`', function() {
		it('should respond with message about what it is disabling', function(done) {
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = 'true';
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('events.twitter.monitoring.disabled'));
				done();
			});

			var res = { message: {text: 'stop tweeting about my applications', id: 'anId', user: {id: 'anId'}}, user: {id: 'anId'}, response: room, reply: function(){} };
			room.robot.emit('twitter.monitoring.disable', res, {});
		});
	});

	// ------------------------------------------------------
	// Test: redundant disable twitter monitoring
	// ------------------------------------------------------
	context('user calls `disable twitter monitoring`', function() {
		it('should respond with message that it is already disabled', function(done) {
			process.env.HUBOT_TWITTER_MONITORING_ENABLED = 'false';
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('events.twitter.monitoring.nothing'));
				done();
			});

			var res = { message: {text: 'stop tweeting about my applications', id: 'anId', user: {id: 'anId'}}, user: {id: 'anId'}, response: room, reply: function(){} };
			room.robot.emit('twitter.monitoring.disable', res, {});
		});
	});

	// ------------------------------------------------------
	// Test: edit tweets
	// ------------------------------------------------------
	context('user calls `twitter monitoring edit tweets`', function() {
		it('should respond with message about editing tweets', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('events.twitter.edit.tweets.prompt'));
				done();
			});

			var res = { message: {text: 'Change my event tweets', id: 'anId', user: {id: 'anId'}}, user: {id: 'anId'}, response: room, reply: function(){} };
			room.robot.emit('twitter.tweet.edit', res, {});
		});
	});

	// ------------------------------------------------------
	// Test: edit events - enable
	// ------------------------------------------------------
	context('user calls `twitter monitoring edit events`', function() {
		it('should respond with message about editing events, and we enable one of them', function(done) {
			setTimeout(function(){
				expect(room.messages[room.messages.length - 2][1]).to.contain(i18n.__('events.twitter.edit.events.prompt', '\'enable 1,2,3\' or \'disable 1 2\''));
				done();
			}, 200);
			var res = { message: {text: 'Setup twitter events', id: 'anId', user: {id: 'anId'}}, user: {id: 'anId'}, response: room, reply: function(){} };
			room.robot.emit('twitter.event.list', res, {});
		});
	});

	// ------------------------------------------------------
	// Test: list tweets
	// ------------------------------------------------------
	context('user calls `twitter monitoring list tweets`', function() {
		it('should create a list of tweets.', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				if (event.attachments && event.attachments.length >= 1){
					expect(event.attachments[0].title).to.contain(i18n.__('events.twitter.app.scaling.title'));
					done();
				}
			});

			var res = { message: {text: 'Show twitter monitoring posts', user: {id: 'anId'}}, user: {id: 'anId'}, response: room, reply: function(){}};
			room.robot.emit('twitter.tweet.list', res, {});
		});
	});

});
