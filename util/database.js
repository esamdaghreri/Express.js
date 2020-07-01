const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    mongoClient.connect('mongodb+srv://esam:BkzISNpq9f4e49ld@cluster0.v1w8k.mongodb.net/shop?retryWrites=true&w=majority')
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