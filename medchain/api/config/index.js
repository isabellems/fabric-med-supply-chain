module.exports = {
  port: "3331",
  network: 'first-network',
  channel: 'mychannel',
  contract: 'med',
  organisations: [
    {
      name: 'org1',
      connectionFile: 'connection-org1.json',
      departments: [
        'org1.department1'
      ],
      msp: 'Org1MSP',
      admin: 'admin@org1',
      ca: 'ca.org1.example.com'
    },
    {
      name: 'org2',
      connectionFile: 'connection-org2.json',
      departments: [
        'org2.department1'
      ],
      msp: 'Org2MSP',
      admin: 'admin@org2',
      ca: 'ca.org2.example.com'
    },
    {
      name: 'org3',
      connectionFile: 'connection-org3.json',
      departments: [
	 'org3.department1'
      ],
      msp: 'Org3MSP',
      admin: 'admin@org3',
      ca: 'ca.org3.example.com'
    }
  ],
  users: [
     {
       name: 'peer0',
       organisation: 'org1',
       token: 's32dqwd'
     }, {
       name: 'peer1',
       organisation: 'org1',
       token: 'sdsd221'
     }, {
       name: 'peer0',
       organisation: 'org2',
       token: '21sadjd'
     }, {
       name: 'peer1',
       organisation: 'org2',
       token: 'djsja22'
     }, { 
       name: 'peer0',
       organisation: 'org3',
       token: 'sdkad222'
     }, {
       name: 'peer1',
       organisation: 'org3',
       token: 's232hjhd'
     }
  ]
}
