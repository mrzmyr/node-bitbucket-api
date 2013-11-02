# node-bitbucket-api [![Build Status](https://secure.travis-ci.org/mrzmyr/node-bitbucket-api.png?branch=master)](http://travis-ci.org/mrzmyr/node-bitbucket-api)

bitbucket api node wrapper

## Getting Started
Install the module with: `npm install node-bitbucket-api`

## Examples

```javascript
var bitbucket = require('node-bitbucket-api');
var client = bitbucket.createClient({
    username: 'USER',
    password: 'PWD'
});
var repository = client.getRepository({
	slug: 'SLUG',
	owner: 'OWNER'
}, function (err, repo) {
   //Code to access the repo object.
});
```
## Credits

- Thanks to [hgarcia](https://npmjs.org/~hgarcia) for [bitbucket-api](https://npmjs.org/package/bitbucket-api)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

