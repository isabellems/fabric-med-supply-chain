const config = require('../config');

function validateCredentials(username, organisation, token) {
  console.log(username);
  console.log(organisation);
  console.log(token);
  const user = config.users.find(u => u.name == username && u.organisations.includes(organisation) && u.token == token);
  console.log('User');
  console.log(user);
  return user;
}

module.exports.validateCredentials = validateCredentials;
