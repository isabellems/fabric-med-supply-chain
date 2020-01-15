/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');


async function enrollAdmin(organisation) {
    let connectionFile = '';
    let caName = '';
    let mspName = '';
    let userName = `admin@${organisation}`;
    if (organisation === 'org1') {
	    connectionFile = 'connection-org1.json';
	    caName = 'ca.org1.example.com';
	    mspName = 'Org1MSP';
    } else if (organisation === 'org2') {
	    connectionFile = 'connection-org2.json';
	    caName = 'ca.org2.example.com';
	    mspName = 'Org2MSP';
    } else if (organisation === 'org3') {
	    connectionFile = 'connection-org3.json';
	    caName = 'ca.org3.example.com';
	    mspName = 'Org3MSP';
    } else {
	    throw 'Given org does not exist';
    }
    
    const ccpPath = path.resolve(__dirname, '../..', '..', 'first-network', connectionFile);
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(ccpJSON);

    try {

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[caName];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), `identity/admin/wallet`);
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(userName);
        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: userName, enrollmentSecret: 'adminpw' });
        const identity = X509WalletMixin.createIdentity(mspName, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(userName, identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user \"${userName}\": ${error}`);
        process.exit(1);
    }
}

module.exports = enrollAdmin;

