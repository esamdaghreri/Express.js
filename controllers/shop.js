const mongodb = require('mongodb');

const Product = require('../models/product');

module.exports.getIndex = (req, res, next) => {
    res.render('shop/index', {pageTitle: 'Shop', path: '/'});
}

module.exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render('shop/product-list', {prods: products, pageTitle: 'Products', path: '/products'});
        }).catch(error => {
            console.log(error);
        });
}

module.exports.getProduct = (req, res, next) => {
    const  prodId = new mongodb.ObjectID(req.params.productId);
    let product;
    Product.findById(prodId).then(product => {
        res.render('shop/product-detail', {product: product, pageTitle: product.title, path: '/products'});
    }).catch(error => console.log(error));
}

module.exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then(products => {
        res.render('shop/cart', { pageTitle: 'Your Cart', path: '/cart', products: products });
    })
    .catch(error => {
        console.log(error);
    });
}

module.exports.postCart = (req, res, next) => {
    const  prodId = req.body.productId;

    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(error => {
            console.log(error);
        });
}

module.exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user
        .deleteItemFromCart(productId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(error => {
            console.log(error);
        });
};

module.exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user
    .addOrder()
    .then(result => {
        res.redirect('/orders');
    })
    .catch(error => {
        console.log(error);
    });
};

module.exports.getOrders = (req, res, next) => {
    req.user
        .getOrders()
        .then(orders => {
            res.render('shop/orders', {pageTitle: 'Your Orders', path: '/orders', orders: orders});
        })
        .catch(error => {
            console.log(error);
        });
}