const mongodb = require('mongodb');
const fs = require('fs');
const path = require('path');
const PDFDocumnet = require('pdfkit');

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
};

module.exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if(!order) {
                return next(new Error('No order found'));
            }
            if(order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized')); 
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            // Using PDFKIT to generate pdf invoice with dinamic data
            const pdfDoc = new PDFDocumnet();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            // Write a single line
            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            });
            pdfDoc.text('---------------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(16).text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`)
            });
            pdfDoc.text('---------------');
            pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);
            // End to write to the file
            pdfDoc.end();

            // Using this way by read file into memory is takes much more time for large file. So, it's not good way to do.
            // fs.readFile(invoicePath, (error, data) => {
            //     if(error) {
            //         return next(error);
            //     }
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            //     res.send(data);
            // });

            // Streaming files is much more better that reading with big files and many requests at the same time.
            // const file = fs.createReadStream(invoicePath);
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            // file.pipe(res); // response is writable stream 
        })
        .catch(error => {
            next(error);
        })
}