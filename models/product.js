const path = require('path');
const fs = require('fs')

const rootDir = require('../util/path');
const Cart = require('./cart');

const p = path.join(rootDir, 'data', 'product');
const getProductFromFile = callback => {
    let  products;
    fs.readFile(p, (err, fileContent) => {
        if(err) {
            return callback([]);
        }else{
            callback(JSON.parse(fileContent));
        }
    });
};

module.exports = class Product{
    constructor(id, title, imageURL, price, description){
        this.id = id;
        this.title = title;
        this.imageURL = imageURL;
        this.price = price;
        this.description = description;
    }

    store() {
        getProductFromFile(products => {
            // Check if this product has ID, that means it want to update the product
            if(this.id){
                const existingProductIndex = products.findIndex(product => product.id === this.id);
                const updateProducts = [...products];
                // update product by override it with new values
                updateProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updateProducts), err => {
                    console.log(err);
                });
            }
            // If not has ID, that mean it new product.
            else{
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                    console.log(err);
                });
            }
        });
    }

    static fetchAll(callback){
        getProductFromFile(callback);
    }

    static findById(id, callback){
        getProductFromFile(products => {
            const product = products.find(p => p.id === id);
            callback(product);
        });
    }

    static deleteById(id){
        getProductFromFile(products => {
            const product = products.find(product => product.id === id);
            const updateProducts = products.filter(product => product.id !== id);
            fs.writeFile(p, JSON.stringify(updateProducts), err => {
                if(!err) {
                    Cart.deleteProduct(id, product.price);
                }
            });

        });
    }
}