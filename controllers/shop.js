const Product = require('../models/product');
const Cart = require('../models/cart');

module.exports.getIndex = (req, res, next) => {
    res.render('shop/index', {pageTitle: 'Shop', path: '/'});
}

module.exports.getProducts = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/product-list', {prods: products, pageTitle: 'Products', path: '/products'});
    }).catch(error => {
        console.log(error);
    });
}

module.exports.getProduct = (req, res, next) => {
    const  prodId = req.params.productId;
    let product;
    Product.findByPk(prodId).then(product => {
        res.render('shop/product-detail', {product: product, pageTitle: product.title, path: '/products'});
    }).catch(error => console.log(error));
}

module.exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then(cart => {
        return cart.getProducts().then(products => {
            res.render('shop/cart', {pageTitle: 'Your Cart', path: '/cart', products: products});
        }).catch(error => {
            console.log(error);
        });
    })
    .catch(error => {
        console.log(error);
    });
}

module.exports.postCart = (req, res, next) => {
    const  prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;

    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({where: {id: prodId}});
        })
        .then(products => {
            let product;
            if(products.length > 0) {
                product = products[0];
            }
            if(product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(prodId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, { 
                through: { quantity: newQuantity } 
            });
        })
        .then(resualt => {
            res.redirect('/cart');
        })
        .catch(error => {
            console.log(error);
        });
}

module.exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            let product = products[0];
            return product.cartItem.destroy();
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(error => {
            console.log(error);
        });
};

module.exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart
            return cart.getProducts();
        })
        .then(products => {
            return req.user
                .createOrder()
                .then(order => {
                    return order.addProducts(products.map(product => {
                        product.orderItem = { quantity: product.cartItem.quantity };
                        return product;
                    }));
                })
                .catch(error => {
                    console.log(error);
                });
        })
        .then(result => {
            return fetchedCart.setProducts(null);
        })
        .then(result => {
            res.redirect('/orders');
        })
        .catch(error => {
            console.log(error);
        });
};

module.exports.getOrders = (req, res, next) => {
    req.user
        .getOrders({include: ['products']})
        .then(orders => {
            res.render('shop/orders', {pageTitle: 'Your Orders', path: '/orders', orders: orders});
        })
        .catch(error => {
            console.log(error);
        });
}