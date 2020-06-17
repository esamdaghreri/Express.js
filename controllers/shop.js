const Product = require('../models/product');
const Cart = require('../models/cart');

module.exports.getIndex = (req, res, next) => {
    Product.fetchAll(products => {
        // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
        res.render('shop/index', {prods: products, pageTitle: 'Shop', path: '/'});
    });
}

module.exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
        res.render('shop/product-list', {prods: products, pageTitle: 'Products', path: '/products'});
    });
}

module.exports.getProduct = (req, res, next) => {
    const  prodId = req.params.productId;
    let product;
    Product.findById(prodId, product => {
        res.render('shop/product-detail', {product: product, pageTitle: product.title, path: '/products'});
    });
}

module.exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProduct = [];
            for(product of products){
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if(cartProductData){
                    cartProduct.push({productData: product, qty: cartProductData.qty});
                }
            }
            res.render('shop/cart', {pageTitle: 'Your Cart', path: '/cart', products: cartProduct});
        })
    })
}

module.exports.postCart = (req, res, next) => {
    const  prodId = req.body.productId;

    // Product is a static method but second agrument is asynchronous (go to product model get an idea or read about fs library of node js)
    Product.findById(prodId, product => {
        Cart.addProduct(prodId, product.price);
    });
    res.redirect('/');
}

module.exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        Cart.deleteProduct(productId, product.price);
        res.redirect('/cart');
    });
};

module.exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {pageTitle: 'Your Orders', path: '/orders'});
}

module.exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {pageTitle: 'Checkout', path: '/checkout'});
}