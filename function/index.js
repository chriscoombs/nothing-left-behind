const {
  MongoClient,
} = require('mongodb');

const {
  cosmosDb,
  dbString,
  collectionString,
} = process.env;

// TODO Convert to CosmosDB trigger
const {
  trigger,
} = require('./trigger');

const updateTimeThingLastSeen = (thing, family) => new Promise((resolve, reject) => {
  let connection; 
  let db; 
  let collection;
  Promise.resolve()
    .then(() => MongoClient.connect(cosmosDb))
    .then((_connection) => {
      connection = _connection;
      db = connection.db(dbString);
      collection = db.collection(collectionString);
      const now = new Date();
      return collection.updateOne({ thing }, { $set: { now, family, gone: false } }, { upsert: true });
    })
    .then(() => {
      connection.close();
      // TODO Remove, replace with CosmosDB trigger
      return trigger(family);
    })
    .then(() => {
      resolve();
    })
    .catch((err) => {
      reject(err);
    });
});

module.exports = (context, IoTHubMessages) => {
  context.log(`JavaScript eventhub trigger function called for message array: ${IoTHubMessages}`);
  const promises = [];
  IoTHubMessages.forEach((message) => {
    context.log(`Processed message: ${message}`);
    const thing = message.split(',')[0];
    const family = message.split(',')[1];
    // v1 code for diffing network signal strength
    const networks = [];
    message.split(',').slice(2).forEach((network) => {
      const data = network.split('|');
      if (data.length === 3) {
        networks.push({
          macAddress: data[0].toLowerCase(),
          signalStrength: data[1],
          channel: data[2],
        });
      }
    });
    promises.push(updateTimeThingLastSeen(thing, family));
  });
  Promise.all(promises)
    .then(() => {
      context.done();
    })
    .catch((err) => {
      context.log.error(err);
      context.done(err);
    });
};