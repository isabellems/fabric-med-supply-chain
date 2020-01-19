const express = require('express');
const bodyParser = require('body-parser');
const { validateCredentials } = require('./lib/util'); 
const { authorizeUser, validateIdentity, createGateway } = require('./lib/middleware');
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

var app = express();
app.use(bodyParser.json());

const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
console.log(ccpPath)

app.use(authorizeUser, validateIdentity, createGateway);

app.post('/api/createDrugPackage', async (req, res) => {
  try {
    
    console.log('In route');
    
    const gateway = req.gateway;
    const contract = req.contract;
    console.log(req.body);

    let id = req.body.id;
    let name = req.body.name;
    let manufacturer = req.body.manufacturer;
    let temperature = req.body.temperature;
    let locationLatitude = req.body.locationLatitude;
    let locationLongitude = req.body.locationLongitude;
    let holder = req.body.holder;
    let pieces = req.body.pieces;
    let timestamp = new Date().getTime().toString();
	
    if(!id || !name || !manufacturer || !temperature || !locationLatitude || !locationLongitude || !holder || !pieces) {
      console.log('Not sufficient arguments');
      return res.status(200).send({ error: "Insufficient arguments" });
    }

    console.log('Before submit');
    await contract.submitTransaction('initDrugPackage', id, name, manufacturer, temperature, locationLatitude, locationLongitude, holder, pieces, timestamp);
    console.log('After submit');
    res.sendStatus(200);

    await gateway.disconnect();

  } catch(e) {
    console.error(`Failed to submit transaction: ${e}`);
    return res.status(200).send({ error: e });
  }
});

app.put('/api/transferDrugPackage/:id', async (req, res) => {
   try {

    const gateway = req.gateway;
    const contract = req.contract;
    
    let id = req.params.id;
    let temperature = req.body.temperature;
    let locationLatitude = req.body.locationLatitude;
    let locationLongitude = req.body.locationLongitude;
    let holder = req.body.holder;
    let pieces = req.body.pieces;
    let timestamp = new Date().getTime().toString();
	
    if(!id || !temperature || !locationLatitude || !locationLongitude || !holder || !pieces) {
      console.log('Not sufficient arguments');
      return res.status(200).send({ error: "Insufficient arguments" });
    }
    
    console.log('Here');
    await contract.submitTransaction('transferDrugPackage', id, holder, temperature, locationLatitude, locationLongitude, pieces, timestamp);
    console.log('There');
    res.sendStatus(200);

    await gateway.disconnect();

  } catch(e) {
    console.error(`Failed to submit transaction: ${e}`);
    return res.status(200).send({ error: e });
  }

});

app.put('/api/moveDrugPackage/:id', async (req, res) => {
  try {

    const gateway = req.gateway;
    const contract = req.contract;
    
    let id = req.params.id;
    let temperature = req.body.temperature;
    let locationLatitude = req.body.locationLatitude;
    let locationLongitude = req.body.locationLongitude;
    let timestamp = new Date().getTime().toString();
	
    if(!id || !temperature || !locationLatitude || !locationLongitude) {
      console.log('Not sufficient arguments');
      return res.status(200).send({ error: "Insufficient arguments" });
    }

    let result = await contract.submitTransaction('moveDrugPackage', id, temperature, locationLatitude, locationLongitude, timestamp);
    res.sendStatus(200);

    await gateway.disconnect();

  } catch(e) {
    console.error(`Failed to submit transaction: ${e}`);
    return res.status(200).send({ error: e });
  }

});

app.get('/api/drugPackages/:id', async (req, res) => {
 try {

    const gateway = req.gateway;
    const contract = req.contract;

    let id = req.params.id;
	
    if(!id) {
      console.log('Not sufficient arguments');
      return res.status(200).send({ error: "Insufficient arguments" });
    }

    let result = await contract.evaluateTransaction('readDrugPackage', id);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
    res.status(200).json({ response: result.toString() });

    await gateway.disconnect();

  } catch(e) {
    console.error(`Failed to submit transaction: ${e}`);
    return res.status(200).send({ error: e });
  }

});

app.post('/api/drugPackages', async (req, res) => {
 try {

    const gateway = req.gateway;
    const contract = req.contract;
    
    let selector = {};
    selector.name = req.body.name ? req.body.name : undefined
    selector.manufacturer = req.body.manufacturer ? req.body.manufacturer : undefined
    selector.temperature = req.body.temperature ? req.body.temperature : undefined
    selector.holder = req.body.holder ? req.body.holder : undefined
    selector.pieces = req.body.pieces ? req.body.pieces : undefined
    selector.dateCreated = req.body.dateCreated ? req.body.dateCreated : undefined
    selector.dateShipped = req.body.dateShipped ? req.body.dateShipped : undefined
    if (req.body.location) {
	    selector.location = {}
	    if (req.body.location.latitude) {
		    selector.location.latitude = req.body.location.latitude
	    }
	    if (req.body.location.longitude) {
		    selector.location.longitude = req.body.location.longitude
            }
    }
    console.log('selector')
    console.log(selector)
    let query = JSON.stringify({ selector })
    console.log('query')
    console.log(query)
	
    let result = await contract.evaluateTransaction('queryDrugPackages', query);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
    res.status(200).json({ response: result.toString() });

    await gateway.disconnect();

  } catch(e) {
    console.error(`Failed to submit transaction: ${e}`);
    return res.status(200).send({ error: e });
  }


})

app.get('/api/history/:id', async (req, res) => {
 try {

    const gateway = req.gateway;
    const contract = req.contract;
    
    let id = req.params.id;
	
    if(!id) {
      console.log('Not sufficient arguments');
      return res.status(200).send({ error: "Insufficient arguments" });
    }

    let result = await contract.evaluateTransaction('getHistoryForDrugPackage', id);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
    res.status(200).json({ response: result.toString() });

    await gateway.disconnect();

  } catch(e) {
    console.error(`Failed to submit transaction: ${e}`);
    return res.status(200).send({ error: e });
  }

});

app.listen(3000);

