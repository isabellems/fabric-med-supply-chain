const addUser = require('./lib/addUser');
const config = require('./config');

async function registerUsers() {
  
  try {
    for (user of config.users) {
      let organisation = config.organisations.find(org => org.name == user.organisation);
      await addUser(user.name, organisation);
    }
   } catch(e) {
	console.log(e);
   }

}


registerUsers();
