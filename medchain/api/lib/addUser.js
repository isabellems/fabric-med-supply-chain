/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');


async function addUser(user, organisation) {
  let connectionFile = '';
  let department = '';
  let msp = '';
  if (organisation === 'org1') {
	  connectionFile = 'connection-org1.json';
	  department = 'org1.department1';
	  msp = 'Org1MSP';
  } else if (organisation === 'org2') {
	  connectionFile = 'connection-org2.json';
	  department = 'org2.department1';
	  msp = 'Org2MSP';
  } else if (organisation === 'org3') {
	  connectionFile = 'connection-org3.json';
	  department = 'org3.department1';
	  msp = 'Org3MSP';
  } else {
	  throw 'Given org does not exist';
  }
  const ccpPath = path.resolve(__dirname, '..', '../..', 'first-network', connectionFile);

  try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(user);
        if (userExists) {
            console.log(`An identity for the user \"${user}\" already exists in the wallet`);
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: department, enrollmentID: user, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: user, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity(msp, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(user, userIdentity);
        console.log(`Successfully registered and enrolled admin user \"${user}\" and imported it into the wallet`);


  } catch(e) {
        console.error(`Failed to register user \"${user}\": ${e}`);
        process.exit(1);
  }



}

module.exports = addUser;
