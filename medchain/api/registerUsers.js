const addUser = require('./lib/addUser');
const config = require('./config');

async function registerUsers() {
   let org1 = config.organisations.find(org => org.name == 'org1');
   let org2 = config.organisations.find(org => org.name == 'org2');
   let org3 = config.organisations.find(org => org.name == 'org3');
   try {
	await addUser('peer0', org1);
	await addUser('peer1', org1);
        await addUser('peer0', org2);
	await addUser('peer1', org2);
	await addUser('peer0', org3);
	await addUser('peer1', org3);
   } catch(e) {
	console.log(e);
   }

}


registerUsers();
