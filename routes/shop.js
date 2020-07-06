const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const routes = express.Router();


routes.get('/', shopController.getIndex);

routes.get('/products', shopController.getProducts);

routes.get('/products/:productId', shopController.getProduct);

routes.get('/cart', isAuth, shopController.getCart);

routes.post('/cart', isAuth, shopController.postCart);

routes.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct)

routes.get('/orders', isAuth, shopController.getOrders);

routes.post('/create-order', isAuth, shopController.postOrder);


module.exports = routes;