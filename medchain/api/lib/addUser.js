/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');


async function addUser(user, organisation) {
  let connectionFile = organisation.connectionFile;
  let department = organisation.departments[0];
  let msp = organisation.msp;
  let userName = `${user}@${organisation.name}`;
  let caAdmin = organisation.admin;
  const ccpPath = path.resolve(__dirname, '..', '../..', 'med-network', connectionFile);

  try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), `identity/${user}/wallet`);
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userName);
        if (userExists) {
            console.log(`An identity for the user \"${user}\" already exists in the wallet`);
            return;
        }

        // Check to see if we've already enrolled the admin user.
	const adminWalletPath = path.join(process.cwd(), `identity/admin/wallet`);
	const adminWallet = new FileSystemWallet(adminWalletPath);
        const adminExists = await adminWallet.exists(caAdmin);
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in a wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }
	

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet: adminWallet, identity: caAdmin, discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: department, enrollmentID: userName, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: userName, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity(msp, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(userName, userIdentity);
        console.log(`Successfully registered and enrolled admin user \"${user}\" and imported it into the wallet`);


  } catch(e) {
        console.error(`Failed to register user \"${user}\": ${e}`);
        process.exit(1);
  }



}

module.exports = addUser;
