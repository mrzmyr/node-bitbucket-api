'use strict';

var qs = require('querystring');
var _ = require('lodash');
var Repository = require('./repository');
var curl = require('./curl');

function BitBucket(options) {
  options = options || {};

  this.ROOT = 'api.bitbucket.org';
  this.VERSION = '1.0';

  this.url = 'https://' + this.ROOT + '/' + this.VERSION;

  this.credentials = null;
  this.username = null;
  this.password = null;

  this.setCredentials = function (options) {
    if(!_.has(options, 'username') || !_.has(options, 'password')) {
      return new Error('Username and Password is required.');
    }

    this.username = options.username;
    this.password = options.password;

    this.credentials = '"' + options.username + ':' + options.password + '"';
  };

  this.setCredentials(options);
  this.connection = curl.createConnection(this.credentials);
}

BitBucket.prototype.getRepository = function (repository, cb) {
  if (!repository.slug) {
    return cb(new Error('Repository slug is required.'), null);
  }
  if (!repository.owner) {
    return cb(new Error('Repository owner is required.'), null);
  }
  if (!cb) {
    return cb(new Error('Callback is required.'), null);
  }

  var self = this;
  var url = this.url + '/repositories/' + repository.owner + '/' + repository.slug;

  this.connection.get({ url: url }, function (err, data) {
    cb(err, new Repository(self, data));
  });
};

BitBucket.prototype.repositories = function (cb) {
  var self = this;
  self.user().repositories().getAll(cb);
};

BitBucket.prototype.user = function () {
  var self = this;
  var url = self.url + '/user';
  return {
    get: function (cb) {
      self.connection.get({ url: url }, cb);
    },
    follows: function (cb) {
      self.connection.get({ url: url + '/follows/' }, cb);
    },
    privileges: function (cb) {
      self.connection.get({ url: url + '/privileges/' }, cb);
    },
    update: function (user, cb) {
      if(!user) {
        return new Error('User is required.');
      }
      self.connection.put({ url: url, data: qs.stringify(user) }, cb);
    },
    repositories: function () {
      return {
        dashboard: function (cb) {
          self.connection.get({ url: url + '/repositories/dashboard/' }, cb);
        },
        following: function (cb) {
          self.connection.get({ url: url + '/repositories/overview/' }, cb);
        },
        getAll: function (cb) {
          self.connection.get({ url: url + '/repositories/' }, cb);
        }
      };
    },
  };
};

BitBucket.prototype.users = function (nameOrEmail) {
  var self = this;
  // var url = self.url + '/users';
  var accounUrl = self.url + '/users/' + nameOrEmail;
  return {
    account: function () {
      return {
        followers: function (cb) {
          self.connection.get({ url: accounUrl + '/followers' }, cb);
        },
        get: function (cb) {
          self.connection.get({ url: accounUrl }, cb);
        },
        plan: function (cb) {
          self.connection.get({ url: accounUrl + '/plan' }, cb);
        }
      };
    },
    emails: function () {
      var emailUrl = accounUrl + '/emails';
      return {
        add: function (email, cb) {
          self.connection.put({ url: emailUrl + '/' + email, data: qs.stringify({ 'email': email }) }, cb);
        },
        get: function (email, cb) {
          self.connection.get({ url: emailUrl + '/' + email }, cb);
        },
        getAll: function (cb) {
          self.connection.get({ url: emailUrl }, cb);
        },
        setAsPrimary: function (email, cb) {
          self.connection.put({ url: emailUrl + '/' + email, data: qs.stringify({ 'primary': true }) }, cb);
        }
      };
    }
  };
};

exports.createClient = function (options) {
  return new BitBucket(options);
};
