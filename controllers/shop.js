const mongodb = require('mongodb');

const Product = require('../models/product');
const Order = require('../models/order');

module.exports.getIndex = (req, res, next) => {
    res.render('shop/index', {pageTitle: 'Shop', path: '/'});
}

module.exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {prods: products, pageTitle: 'Products', path: '/products'});
        }).catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
}

module.exports.getProduct = (req, res, next) => {
    const  prodId = new mongodb.ObjectID(req.params.productId);
    let product;
    Product.findById(prodId).then(product => {
        res.render('shop/product-detail', {product: product, pageTitle: product.title, path: '/products'});
    }).catch(error => {
        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    });
}

module.exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items
            res.render('shop/cart', { pageTitle: 'Your Cart', path: '/cart', products: products });
        })
        .catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
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
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
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
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
};

module.exports.postOrder = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items.map(i => {
            return {quantity: i.quantity, product: {...i.productId._doc}};
        });
        const order = new Order({
            user: {
                username: req.user.email,
                userId: req.user
            },
            products: products
        });
        return order.save();
    })
    .then(result => {
        return req.user.clearCart();
    })
    .then(() => {

        res.redirect('/orders');
    })
    .catch(error => {
        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    });
};

module.exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.user})
        .then(orders => {
            res.render('shop/orders', {pageTitle: 'Your Orders', path: '/orders', orders: orders});
        })
        .catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
}