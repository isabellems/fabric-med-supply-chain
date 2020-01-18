const config = require('../config');

function validateCredentials(username, token) {
  const user = config.users.find(u => u.name == username && u.token == token);
  return user;
}

module.exports.validateCredentials = validateCredentials;
