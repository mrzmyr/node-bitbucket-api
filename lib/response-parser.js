function getNewError(mess, payload, err) {
  var ex = new Error(mess);
  ex.prevError = err;
  ex.payload = payload;
  return ex;
}

module.exports = {
  parse: function (stdout, raw) {
    if (raw) {
      return {
        raw: stdout,
        lines: stdout.split('\n')
      };
    }
    if (stdout.indexOf('Oops! An error occurred.') !== -1) {
      throw getNewError(500, stdout);
    }
    if (stdout.indexOf('Not Found') !== -1) {
      throw getNewError(404, stdout);
    }
    if (stdout.indexOf('HTTP/1.1 204 NO CONTENT') !== -1) {
      return null;
    }
    try {
      return JSON.parse(stdout);
    } catch (e) {
      throw getNewError('Parse error', stdout, e);
    }
  }
};
