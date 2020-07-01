const mongodb = require('mongodb');

const Product = require('../models/product');

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {pageTitle: 'Add Product', path: '/admin/add-product'});
}

module.exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageURL = req.body.imageURL;
    const price = req.body.price;
    const description = req.body.description;

    const product = new Product(title, price, imageURL, description, null, req.user._id);
    product.save()
        .then(result => {
            console.log('Product has been added successfully.')
            res.redirect('/products');
        }).catch(error => {
            console.log(error);
        });
}

module.exports.getEditProduct = (req, res, next) => {
    const productId = new mongodb.ObjectID(req.params.productId);
    Product.findById(productId)
        .then(product => { 
            if(!product){
                res.redirect('/');
            }
            res.render('admin/edit-product', {product: product, pageTitle: 'Edit Product', path: '/admin/edit-product'});
        })
        .catch(error => {
            console.log(error);
        });
}

module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const imageURL = req.body.imageURL;
    const price = req.body.price;
    const description = req.body.description;
    
    const product = new Product(title, price, imageURL, description, productId);
    product
        .save()
        .then(result => {
            console.log('Updated successfully!');
            res.redirect('/admin/products');
        }).catch(error => {
            console.log(error);
        });
}

module.exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render('admin/product-list', {prods: products, pageTitle: 'Products', path: '/admin/products'});
        }).catch(error => {
            console.log(error);
        });
}

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.destroyById(productId)
        .then(() => {
            res.redirect('/admin/products');
        }).catch(error => {
            console.log(error);
        });
}