const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    mongoClient.connect('')
        .then(client => {
            console.log('MongoDb connected!');
            _db = client.db();
            callback();
        })
        .catch(error => {
            console.log(error);
            throw error;
        });
};

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found';
};

module.exports.mongoConnect = mongoConnect;
module.exports.getDb = getDb;
