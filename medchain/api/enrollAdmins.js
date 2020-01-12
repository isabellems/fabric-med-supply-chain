const enrollAdmin = require('./lib/enrollAdmin');

async function enrollAdmins() {
   try {
	await enrollAdmin('org1');
	await enrollAdmin('org2');
	await enrollAdmin('org3');
   } catch(e) {
	console.log(e);
   }

}

enrollAdmins();
