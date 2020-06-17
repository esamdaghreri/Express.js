const path = require('path');
const fs = require('fs')

const rootDir = require('../util/path');

const p = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(id, productPrice){
        // Fetch the previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};

            // If error, that means there is no cart.
            if(!err){
                cart = JSON.parse(fileContent);
            }
            // Analyze the cart to find existing product

            // Get the index of target product by id
            const existingProductIndex = cart.products.findIndex(
                prod => prod.id === id
            );
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            // Add new product / increase quantity

            // existingProduct is null, that means there is no product with id given
            if(existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty += 1;
                cart.products = [ ...cart.products ];
                cart.products[existingProductIndex] = updatedProduct;
            }
            // Create new json object for new product
            else {
                updatedProduct = {id: id, qty: 1};
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;

            // Save it as a json file
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });
        })
    }

    static deleteProduct(id, productPrice){
        fs.readFile(p, (err, fileContent) => {
            // if cart is empty, do nothing.
            if(err){
                return;
            }
            const updatedCart = { ...JSON.parse(fileContent) };
            const product = updatedCart.products.find(product => product.id === id);
            if(!product){
                return;
            }
            const productQty = product.qty;
            // Remove delete product
            updatedCart.products = updatedCart.products.filter(
                product => product.id !== id
            );
            // Update total price
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err);
            });
        });
    }
    
    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if(err) {
                cb(null);
            }else {
                cb(cart);
            }
        });
    }
}