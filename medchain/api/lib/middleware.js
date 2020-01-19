const { validateCredentials } = require('./util');
const { FileSystemWallet, Gateway } = require('fabric-network');
const config = require('../config');
const path = require('path');

async function authorizeUser(req, res, next) {
   if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
     return res.send(401).json({ 'message': 'Authorization Header Missing' });
   }

   const base64Credentials = req.headers.authorization.split(' ')[1];
   const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
   const [fullUsername, token] = credentials.split(':');
   console.log('Username ' + fullUsername);
   console.log('Password ' + token);
   const [username, organisation] = fullUsername.split('@');
   const user = validateCredentials(username, organisation, token);
   if (!user) {
     console.log('Invalid credentials');
     return res.status(401).json({ 'message': 'Invalid Credentials' });
   }
   user.identity = fullUsername;
   user.organisation = organisation;
   req.user = user;
   console.log('User');
   console.log(req.user);
   next();
}

async function validateIdentity(req, res, next) {
   const walletPath = path.join(process.cwd(), `identity/${req.user.name}/wallet`);
   console.log(`Wallet is in: ${walletPath}`);
   const wallet = new FileSystemWallet(walletPath);
   const userExists = await wallet.exists(req.user.identity);
   console.log(req.user.identity)
   if(!userExists) {
     console.log('An identity for the user does not exist in the wallet');
     return res.status(401).json({ 'message':'An identity for the user does not exist in the wallet' });
   }
   req.wallet = wallet;
   next();
}

async function createGateway(req, res, next) {
   console.log('User organisation ' + req.user.organisation)
   const organisation = config.organisations.find(org => org.name == req.user.organisation);
   console.log(organisation);
   const ccpPath = path.resolve(__dirname, '../..', '..', config.network, organisation.connectionFile);
   console.log('Ccp Path is ' + ccpPath);
   const gateway = new Gateway();
   await gateway.connect(ccpPath, { wallet: req.wallet, identity: req.user.identity, discovery: { enabled: true, asLocalhost: true } });

   const network = await gateway.getNetwork(config.channel);
   const contract = network.getContract(config.contract);

   req.gateway = gateway;
   req.contract = contract;
   next();
}

module.exports.authorizeUser = authorizeUser;
module.exports.validateIdentity = validateIdentity;
module.exports.createGateway = createGateway;
