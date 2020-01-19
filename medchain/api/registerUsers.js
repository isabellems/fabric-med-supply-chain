const addUser = require('./lib/addUser');
const config = require('./config');

async function registerUsers() {
  
  try {
    for (user of config.users) {
      for (organisation of user.organisations) {
	 let identityOrg = config.organisations.find(org => org.name == organisation);
         await addUser(user.name, identityOrg);
      }
    }
   } catch(e) {
	console.log(e);
   }

}


registerUsers();
