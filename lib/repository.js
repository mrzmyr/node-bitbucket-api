'use strict';

var _ = require('lodash');
var qs = require('querystring');
var curl = require('./curl');

/*
  this.provider = provider;
  this.scm = data.scm; //  'scm': 'git',
  this.hasWiki = data.has_wiki; //': false,
  this.lastUpdated = new Date(data.last_updated); //': '2012-08-21 06:58:33',
  this.creator = data.creator; //': 'hgarcia',
  this.forksCount = data.forks_count; //': 0,
  this.createdOn = new Date(data.created_on); //': '2012-08-21 04:58:37',
  this.owner = data.owner; //': 'inline',
  this.logo = data.logo; //': null,
  this.emailMailingList = data.email_mailinglist; //': ',
  this.isMq = data.is_mq; //': false,
  this.size = data.size; //': 861586,
  this.readOnly = data.read_only; //': false,
  this.forkOff = data.fork_of; //': null,
  this.mqOf = data.mq_of; //': null,
  this.followersCount = data.followers_count; //': 2,
  this.state = data.state; //': 'available',
  this.utcCreatedOn = new Date(data.utc_created_on); //': '2012-08-21 02:58:37+00:00',
  this.website = data.website; //': ',
  this.description = data.description; //': 'Web UI for the customers',
  this.hasIssuses = data.has_issues; //': true,
  this.isFork = data.is_fork; //': false,
  this.slug = data.slug; //': 'app',
  this.isPrivate = data.is_private; //': true,
  this.name = data.name; //': 'app',
  this.language = data.language; //': 'javascript',
  this.utcLastUpdated = new Date(data.utc_last_updated); //': '2012-08-21 04:58:33+00:00',
  this.emailWriters = data.email_writers; //': true,
  this.noPublicForks = data.no_public_forks; //': false,
  this.resourceURI = data.resource_uri; //': '/1.0/repositories/inline/app'
*/

function Repository(provider, data) {
  if(!data) {
    return new Error('Data is required.');
  }

  _.assign(this, data);

  this.provider = provider;
  this.connection = curl.createConnection(this.provider.credentials);

  this.getUrl = function () {
    return this.provider.url + '/repositories/' + this.owner + '/' + this.slug;
  };
}

Repository.prototype.followers = function (cb) {
  var self = this;
  var url = self.getUrl() + '/followers/';

  this.connection.get({ url: url }, cb);
};

Repository.prototype.changeset = function (hash) {
  var self = this;
  var url = self.getUrl() + '/changesets/';

  if (!hash) {
    throw new Error('The changeset hash is required');
  }

  return {
    comments: function () {

      var commentsUrl = url + hash + '/comments';

      return {
        create: function (comment, cb) {
          if (!comment || !comment.content) {
            throw new Error('The comment needs content');
          }
          self.connection.post({ url: commentsUrl, data: qs.stringify(comment) }, cb);
        },
        getAll: function (cb) {
          self.connection.get({ url: commentsUrl }, cb);
        },
        update: function (id, comment, cb) {
          if (!comment || !comment.content) {
            throw new Error('The comment needs content');
          }
          self.connection.put({ url: commentsUrl + '/' + id, data: qs.stringify(comment) }, cb);
        },
        remove: function (id, cb) {
          self.connection.del({ url: commentsUrl + '/' + id, raw: true }, function (err) {
            return err ? cb(err, null) : cb(null, { success: true });
          });
        }
      };
    },
    getDiff: function (cb) {
      self.connection.get({ url: url + hash + '/diff' }, cb);
    },
    getLikes: function (cb) {
      self.connection.get({ url: url + hash + '/likes' }, cb);
    },
    getStats: function (cb) {
      self.connection.get({ url: url + hash + '/diffstat' }, cb);
    }
  };
};

Repository.prototype.changesets = function () {
  var self = this;
  var url = self.getUrl() + '/changesets/';

  return {
    get: function (limit, start, cb) {
      if (!limit || !start) {
        throw new Error('Limit and start are required');
      }
      self.connection.get({ url: url, data: qs.stringify({ limit: limit, start: start }) }, cb);
    },
    getById: function (hash, cb) {
      if (!hash) {
        throw new Error('The changeset hash is required');
      }
      self.connection.get({ url: url + hash }, cb);
    }
  };
};

Repository.prototype.sources = function (path, revision) {
  var self = this;
  var rev = revision || 'master';

  if (path && path.indexOf('/') !== 0) {
    path = '/' + path;
  } else if (!path) {
    path = '/';
  }

  return {
    info: function (cb) {
      self.connection.get({ url: self.getUrl() + '/src/' + rev + path }, cb);
    },
    raw: function (cb) {
      self.connection.get({ url: self.getUrl() + '/raw/' + rev + path, raw: true }, cb);
    }
  };
};

Repository.prototype.issue = function (issueId) {
  var self = this;
  return {
    comments: function () {
      var url = self.getUrl() + '/issues/' + issueId + '/comments/';
      return {
        create: function (content, cb) {
          self.connection.post({ url: url, data: qs.stringify({content: content}) }, cb);
        },
        getById: function (id, cb) {
          self.connection.get({ url: url + id + '/' }, cb);
        },
        getAll: function (cb) {
          self.connection.get({ url: url }, cb);
        },
        update: function (id, content, cb) {
          self.connection.put({ url: url + id + '/', data: qs.stringify({content: content}) }, cb);
        },
        remove: function (id, cb) {
          self.connection.del({ url: url + id + '/' }, cb);
        }
      };
    }
  };
};

Repository.prototype.issues = function () {
  var self = this;
  var url = self.getUrl() + '/issues/';
  return {
    create: function (issue, cb) {
      self.connection.post({ url: url, data: qs.stringify(issue) }, cb);
    },
    getById: function (id, cb) {
      self.connection.get({ url: url + id + '/' }, cb);
    },
    get: function (query, cb) {
      var getUrl = url;
      if (!cb) {
        cb = query;
      } else if (query) {
        getUrl = url + '?' + qs.stringify(query);
      }
      self.connection.get({ url: getUrl }, cb);
    },
    update: function (id, issue, cb) {
      self.connection.put({ url: url + id + '/', data: qs.stringify(issue) }, cb);
    },
    remove: function (id, cb) {
      self.connection.del({ url: url + id + '/' }, cb);
    }
  };
};

Repository.prototype.milestones = function () {
  var self = this;
  var url = self.getUrl() + '/issues/milestones/';
  return {
    create: function (name, cb) {
      self.connection.post({ url: url, data: qs.stringify({name: name}) }, cb);
    },
    getById: function (id, cb) {
      self.connection.get({ url: url + id + '/' }, cb);
    },
    getAll: function (cb) {
      self.connection.get({ url: url }, cb);
    },
    update: function (id, name, cb) {
      self.connection.put({ url: url + id + '/', data: qs.stringify({name: name}) }, cb);
    },
    remove: function (id, cb) {
      self.connection.del({ url: url + id + '/' }, cb);
    }
  };
};

Repository.prototype.versions = function () {
  var self = this;
  var url = self.getUrl() + '/issues/versions/';
  return {
    create: function (name, cb) {
      self.connection.post({ url: url, data: qs.stringify({name: name}) }, cb);
    },

    getById: function (id, cb) {
      self.connection.get({ url: url + id + '/' }, cb);
    },

    getAll: function (cb) {
      self.connection.get({ url: url }, cb);
    },

    update: function (id, name, cb) {
      self.connection.put({ url: url + id + '/', data: qs.stringify({name: name}) }, cb);
    },

    remove: function (id, cb) {
      self.connection.del({ url: url + id + '/' }, cb);
    }
  };
};

Repository.prototype.components = function () {
  var self = this;
  var url = self.getUrl() + '/issues/components/';
  return {
    create: function (name, cb) {
      self.connection.post({ url: url, data: qs.stringify({name: name}) }, cb);
    },

    getById: function (id, cb) {
      self.connection.get({ url: url + id + '/' }, cb);
    },

    getAll: function (cb) {
      self.connection.get({ url: url }, cb);
    },

    update: function (id, name, cb) {
      self.connection.put({ url: url + id + '/', data: qs.stringify({name: name}) }, cb);
    },

    remove: function (id, cb) {
      self.connection.del({ url: url + id + '/' }, cb);
    }
  };
};

Repository.prototype.branches = function () {
  var self = this;
  var url = self.getUrl() + '/branches/';
  return {
    getAll: function (cb) {
      self.connection.get({ url: url }, cb);
    }
  };
};

module.exports = Repository;
