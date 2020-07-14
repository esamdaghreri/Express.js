const mongodb = require('mongodb');
const mongoose = require('mongoose');

const {validationResult} = require('express-validator/check');

const Product = require('../models/product');
const fileHelper = require('../util/file');

const ITEMS_PER_PAGE = 8;

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
};

module.exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);
    if(!image) {
        return res.status(422).render(
            'admin/add-product',
            {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                errorMessage: 'Attached file is not an image.',
                oldInput: {
                    title: title,
                    price: price,
                    description: description
                },
                validationErrors: []
            }
        );
    }

    // The path of image
    const imageURL = image.path;

    if(!errors.isEmpty()){
        return res.status(422).render(
            'admin/add-product',
            {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    title: title,
                    price: price,
                    description: description
                },
                validationErrors: errors.array()
            }
        );
    }

    const product = new Product({
        title: title,
        price: price,
        imageURL: imageURL,
        description: description,
        userId: req.session.user
    });
    product.save()
        .then(result => {
            console.log('Product has been added successfully.')
            res.redirect('/products');
        }).catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
};

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
                        price: product.price,
                        description: product.description,
                        productId: productId
                    },
                    validationErrors: []
                }
            );
        })
        .catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
};

module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const image = req.file;
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
            product.price = price;
            product.description = description;
            if(image){
                fileHelper.deleteFile(product.imageURL);
                product.imageURL = image.path;
            }
            return product.save()
                .then(result => {
                    console.log('Updated successfully!');
                    res.redirect('/admin/products');
                })
        })
        .catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
};

module.exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find({userId: req.user._id})
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('admin/product-list',
            {
                prods: products,
                pageTitle: 'Products',
                path: '/admin/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            }
        );
        }).catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
};

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            if(!product){
                return next(new Error('Product not found!'));
            }
            fileHelper.deleteFile(product.imageURL);
            return Product.deleteOne({_id: productId, userId: req.user._id})
        })
        .then(() => {
            res.redirect('/admin/products');
        }).catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
};