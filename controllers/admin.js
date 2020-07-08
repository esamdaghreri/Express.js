const mongodb = require('mongodb');
const {validationResult} = require('express-validator/check');

const Product = require('../models/product');

module.exports.getAddProduct = (req, res, next) => {
    if(!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        oldInput: {
            title: '',
            imageURL: '',
            price: '',
            description: ''
        },
        errorMessage: null,
        validationErrors: []
    });
}

module.exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageURL = req.body.imageURL;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render(
            'admin/add-product',
            {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    title: title,
                    imageURL: imageURL,
                    price: price,
                    description: description
                },
                validationErrors: errors.array()
            }
            );
    }

    const product = new Product({title: title, price: price, imageURL: imageURL, description: description, userId: req.session.user});
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
            res.render(
                'admin/edit-product',
                {
                    product: product,
                    pageTitle: 'Edit Product',
                    path: '/admin/edit-product',
                    oldInput: {
                        title: product.title,
                        imageURL: product.imageURL,
                        price: product.price,
                        description: product.description,
                        productId: productId
                    },
                    validationErrors: []
                }
            );
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
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render(
            'admin/edit-product',
            {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    title: title,
                    imageURL: imageURL,
                    price: price,
                    description: description,
                    productId: productId
                },
                validationErrors: errors.array()
            }
            );
    }
    
    Product
        .findById(productId).then(product => {
            if(product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = title;
            product.imageURL = imageURL;
            product.price = price;
            product.description = description;
            return product.save()
                .then(result => {
                    console.log('Updated successfully!');
                    res.redirect('/admin/products');
                })
        })
        .catch(error => {
            console.log(error);
        });
}

module.exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        .then(products => {
            res.render('admin/product-list', {prods: products, pageTitle: 'Products', path: '/admin/products'});
        }).catch(error => {
            console.log(error);
        });
}

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteOne({_id: productId, userId: req.user._id})
        .then(() => {
            res.redirect('/admin/products');
        }).catch(error => {
            console.log(error);
        });
}