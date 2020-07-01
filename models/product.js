const mongodb = require('mongodb')

const getDb = require('../util/database').getDb;

class Product {
    constructor(title, price, imageURL, description, id, userId){
        this.title = title;
        this.price = price;
        this.imageURL = imageURL;
        this.description = description;
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        let dbOp
        if(this._id){
            // Update the product
            console.log(this._id)
            dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this});
        } else {
            dbOp = db.collection('products').insertOne(this);
        }
        return dbOp
            .then(result => {
                return result;
            })
            .catch(error => {
                console.log(error);
            });
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                return products;
            })
            .catch(error => {
                console.log(error);
            });
    }

    static findById(id) {
        const db = getDb();
        return db.collection('products')
            .find({_id: new mongodb.ObjectId(id)})
            .next()
            .then(product => {
                return product;
            })
            .catch(error => {
                console.log(error);
            });
    }

    static destroyById(id) {
        const db = getDb();

        const prodcutId = new mongodb.ObjectID(id);

        return db.collection('products')
            .deleteOne({_id: prodcutId})
            .then(resutl => {
            console.log('Product has been deleted successfully!')
                return resutl;
            })
            .catch(error => {
                console.log(error);
            });

    }
}

module.exports = Product;