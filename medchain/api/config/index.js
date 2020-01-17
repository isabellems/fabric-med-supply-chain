module.exports = {
  port: "3331",
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
  ]
}
