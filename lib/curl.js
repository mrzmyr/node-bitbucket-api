'use strict';
var _ = require('lodash');
var exec = require('child_process').exec;
var parser = require('./response-parser');

function Connection(credentials) {
  this.credentials = credentials;

  this.run = function(args, cb) {

    if(!_.has(args, 'url')) {
      cb(new Error('url argument is required for curl post'), null);
    }

    var cmd = ['curl'];

    if(_.has(args, 'method')) {
      switch(args.method.toLowerCase()) {
        case 'get': cmd.push('--GET'); break;
        case 'delete': cmd.push('--include --request DELETE'); break;
        case 'put': cmd.push('--request PUT'); break;
      }
    }

    cmd.push('--user ' + this.credentials);
    cmd.push(args.url)

    if(_.has(args, 'data')) {
      cmd.push('--data ' + data)
    }

    var command = cmd.join(' ');
    var raw = (_.has(args, 'raw') && args.raw === true) || false;

    exec(command, function (error, stdout) {
      try {
        var response = parser.parse(stdout, raw);
        if(_.isFunction(cb)) {
          cb(null, response);
        }
      } catch (e) {
        if(_.isFunction(cb)) {
          cb(e, null);
        }
      }
    }).on('error', function (err) {
      cb(err, null);
    });
  };
}

Connection.prototype.get = function (args, cb) {
  args.method = 'get';
  this.run(args, cb);
};

Connection.prototype.post = function (args, cb) {
  this.run(args, cb);
};

Connection.prototype.put = function (args, cb) {
  args.method = 'put';
  this.run(args, cb);
};

Connection.prototype.del = function (args, cb) {
  args.method = 'delete';
  this.run(args, cb);
};

exports.createConnection = function (credentials) {
  return new Connection(credentials);
};
