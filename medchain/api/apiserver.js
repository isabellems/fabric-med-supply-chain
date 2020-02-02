const express = require('express');
const bodyParser = require('body-parser');
const { validateCredentials } = require('./lib/util'); 
const { authorizeUser, validateIdentity, createGateway } = require('./lib/middleware');
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

var app = express();
app.use(bodyParser.json());

console.log('Server started! Listening to port 3000');

app.use(authorizeUser, validateIdentity, createGateway);

app.post('/api/createDrugPackage', async (req, res) => {
  const gateway = req.gateway;
  const contract = req.contract;
  console.log(req.body);

  let id = req.body.id;
  let name = req.body.name;
  let manufacturer = req.body.manufacturer;
  let temperature = req.body.temperature;
  let humidity = req.body.humidity;
  let locationLatitude = req.body.locationLatitude;
  let locationLongitude = req.body.locationLongitude;
  let holder = req.body.holder;
  let pieces = req.body.pieces;
  let timestamp = new Date().getTime().toString();
	
  if(!id || !name || !manufacturer || !temperature || !humidity || !locationLatitude || !locationLongitude || !holder || !pieces) {
    console.log('Not sufficient arguments');
    return res.status(200).json({ error: "Insufficient arguments" });
  }
  console.log('Submitting transaction...');
  
  try {
    await contract.submitTransaction('initDrugPackage', id, name, manufacturer, temperature, humidity, locationLatitude, locationLongitude, holder, pieces, timestamp);
    console.log('Transaction submitted successfully');
  } catch(e) {
    console.log('Failed to submit transaction');
    console.log(e);
    res.status(200).json({ error: e.message });
    await gateway.disconnect();
    return;
  }
  res.sendStatus(200);
  await gateway.disconnect();
});

app.put('/api/transferDrugPackage/:id', async (req, res) => {
  const gateway = req.gateway;
  const contract = req.contract;
    
  let id = req.params.id;
  let temperature = req.body.temperature;
  let humidity = req.body.humidity;
  let locationLatitude = req.body.locationLatitude;
  let locationLongitude = req.body.locationLongitude;
  let holder = req.body.holder;
  let pieces = req.body.pieces;
  let timestamp = new Date().getTime().toString();
	
  if(!id || !temperature || !humidity || !locationLatitude || !locationLongitude || !holder || !pieces) {
    console.log('Not sufficient arguments');
    return res.status(200).json({ error: "Insufficient arguments" });
  }
    
  console.log('Submitting transaction...');
  try {
    await contract.submitTransaction('transferDrugPackage', id, holder, temperature, humidity, locationLatitude, locationLongitude, pieces, timestamp);
    console.log('Transaction submitted successfully');
  } catch(e) {
    console.log('Failed to submit transaction');
    console.log(e);
    res.status(200).json({ error: e.message });
    await gateway.disconnect();
    return;
  }
  res.sendStatus(200);
  await gateway.disconnect();
});

app.put('/api/moveDrugPackage/:id', async (req, res) => {
  const gateway = req.gateway;
  const contract = req.contract;
    
  let id = req.params.id;
  let temperature = req.body.temperature;
  let humidity = req.body.humidity;
  let locationLatitude = req.body.locationLatitude;
  let locationLongitude = req.body.locationLongitude;
  let timestamp = new Date().getTime().toString();
	
  if(!id || !temperature || !humidity || !locationLatitude || !locationLongitude) {
    console.log('Not sufficient arguments');
    return res.status(200).json({ error: "Insufficient arguments" });
  }

  console.log('Submitting transaction...');
  try {
    await contract.submitTransaction('moveDrugPackage', id, temperature, humidity, locationLatitude, locationLongitude, timestamp);
    console.log('Transaction submitted successfully');
  } catch(e) {
    console.log('Failed to submit transaction');
    console.log(e)
    res.status(200).json({ error: e.message });
    await gateway.disconnect();
    return;
  }
  res.sendStatus(200);
  await gateway.disconnect();
});

app.get('/api/drugPackages/:id', async (req, res) => {
  const gateway = req.gateway;
  const contract = req.contract;

  let id = req.params.id; 
  if(!id) {
    console.log('Not sufficient arguments');
    return res.status(200).json({ error: "Insufficient arguments" });
  }
  let result;
  console.log('Evaluating transaction...');
  try {
    console.log('Id:');
    console.log(id);
    result = await contract.evaluateTransaction('readDrugPackage', id);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
  } catch(e) {
    console.error(`Failed to submit transaction: ${e}`);
    res.status(200).json({ error: e.message });
    await gateway.disconnect();
    return;
  }

  res.status(200).json({ response: result.toString() });
  await gateway.disconnect();
});

app.post('/api/drugPackages', async (req, res) => {

  const gateway = req.gateway;
  const contract = req.contract;
    
  let selector = {};
  const availableFilters = ['name', 'manufacturer', 'temperature', 'humidity', 'holder', 'pieces', 'dateCreated', 'dateShipped', 'locationLatitude', 'locationLongitude'];
  console.log('Body');
  console.log(req.body);
  for (filter of Object.keys(req.body)) {
    console.log(filter);
    if (!availableFilters.includes(filter)) {
      return res.status(200).json({ error: `Invalid filter ${filter}` })
    }
    if (filter == 'locationLatitude' || filter == 'locationLongitude') {
      selector.location = {};
      selector.location.latitude = (filter == 'locationLatitude') ? req.body[filter] : undefined;
      selector.location.longitude = (filter == 'locationLongitude') ? req.body[filter] : undefined;
    } else {
      selector[filter] = req.body[filter]
    }
  }
    
  console.log('Selector:');
  console.log(selector)
  let query = JSON.stringify({ selector: selector })
  console.log('Query:');
  console.log(query);
    
  let result;
  console.log('Evaluating transaction...');
  try {
    result = await contract.evaluateTransaction('queryDrugPackages', query);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
  } catch(e) {
    console.error(`Failed to submit transaction: ${e}`);
    res.status(200).json({ error: e.message });
    await gateway.disconnect();
    return;
  }

  res.status(200).json({ response: result.toString() });
  await gateway.disconnect();
});

app.get('/api/history/:id', async (req, res) => {

  const gateway = req.gateway;
  const contract = req.contract;
    
  let id = req.params.id;

  if(!id) {
    console.log('Not sufficient arguments');
    return res.status(200).json({ error: "Insufficient arguments" });
  }

  let result;
  console.log('Evaluating transaction...');
  try {
    result = await contract.evaluateTransaction('getHistoryForDrugPackage', id);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
  } catch(e) {
    console.error(`Failed to submit transaction: ${e}`);
    res.status(200).json({ error: e.message });
    await gateway.disconnect();
    return;
  }

  res.status(200).json({ response: result.toString() });
  await gateway.disconnect();
});

app.delete('/api/drugPackages/:id', async (req, res) => {

  const gateway = req.gateway;
  const contract = req.contract;
    
  let id = req.params.id;

  if(!id) {
    console.log('Not sufficient arguments');
    return res.status(200).json({ error: "Insufficient arguments" });
  }

  let result;
  console.log('Evaluating transaction...');
  try {
    result = await contract.submitTransaction('deleteDrugPackage', id);
    console.log(`Transaction has been submitted, result is: ${result.toString()}`);
  } catch(e) {
    console.error(`Failed to submit transaction: ${e}`);
    res.status(200).json({ error: e.message });
    await gateway.disconnect();
    return;
  }

  res.status(200).json({ response: result.toString() });
  await gateway.disconnect();
});

app.listen(3000);

