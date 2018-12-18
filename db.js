const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017';

const dbName = 'demo-socketio';

//const client = new MongoClient(url);

module.exports = new MongoClient(url);