const addUser = require('./lib/addUser');

async function registerUsers() {
   try {
	//await addUser('peer0', 'org1');
	//await addUser('peer1', 'org1');
        //await addUser('peer0', 'org2');
	//await addUser('peer1', 'org2');
	await addUser('peer0', 'org3');
	//await addUser('peer1', 'org3');
   } catch(e) {
	console.log(e);
   }

}


registerUsers();
