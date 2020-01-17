const enrollAdmin = require('./lib/enrollAdmin');
const config = require('./config');

async function enrollAdmins() {
   try { 
     for (organisation of config.organisations) {
       await enrollAdmin(organisation);
     }
   } catch(e) {
	console.log(e);
   }

}

enrollAdmins();
