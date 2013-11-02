/*jshint unused: false */

var _ = require('lodash');
var bitbucket = require('../lib/bitbucket.js');

exports.usernameAndPassword = function(test){
	var client = bitbucket.createClient({
		username: 'Derpina',
		password: 'somepass1337'
	});

	test.equal(_.isObject(client), true);
	test.equal(_.isString(client.password), true, 'Has a password');
	test.equal(_.isString(client.username), true, 'Has a username');
	test.done();
};