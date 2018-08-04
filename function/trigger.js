const {
    cosmosDb,
    dbString,
    collectionString,
    twilioSid,
    twilioAuthToken,
    // TODO Get phone number from CosmosDB based on family
    tempNumber,
} = process.env;

const {
    MongoClient,
} = require('mongodb');
const client = require('twilio')(twilioSid, twilioAuthToken);

const sendMessage = (leftBehind, to) => {
    const alertString = (leftBehind.length === 1)
        ? leftBehind[0]
        : leftBehind.reduce((result, alert, index, arr) => {
            let updatedResult = result;
            if (index === 0) {
                updatedResult += `${alert} (and`;
            } else {
                updatedResult += ` ${alert}`;
                if (index === arr.length - 1) {
                    updatedResult += ')';
                } else {
                    updatedResult += ',';
                }
            }
            return updatedResult;
        }, '');
    return client.messages.create({
        from: 'NoThing',
        to,
        body: `Don't forget your ${alertString}!`,
    });
};

const trigger = (family) => new Promise((resolve, reject) => {
    let connection; let db; let
        collection;
    const gone = [];
    Promise.resolve()
        .then(() => MongoClient.connect(cosmosDb))
        .then((_connection) => {
            connection = _connection;
            db = connection.db(dbString);
            collection = db.collection(collectionString);
            const query = {
                family: {
                    $eq: family
                },
                gone: {
                    $eq: false,
                },
            };
            return collection.find(query).toArray();
        })
        .then((result) => {
            const now = new Date();
            result.forEach((document) => {
                const then = new Date(document.now);
                if (now - then > 60000) {
                    gone.push(document.thing);
                }
            });
            const leftBehind = result
                .filter(document => !gone.includes(document.thing))
                .map(document => document.thing);
            return (gone.length > 0) ? sendMessage(leftBehind, tempNumber) : Promise.resolve();
        })
        .then(() => {
            const promises = [];
            gone.forEach((thing) => {
                promises.push(collection.updateOne({ thing }, { $set: { gone: true } }, { upsert: true }));
            });
            return Promise.all(promises);
        })
        .then(() => {
            connection.close();
            resolve();
        })
        .catch((err) => {
            connection.close();
            reject(err);
        });
});

module.exports = {
    trigger,
};
