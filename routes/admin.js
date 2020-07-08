const express = require('express');
const {body} = require('express-validator/check');

const router = express.Router();

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post(
    '/add-product',
    isAuth,
    [
        body('title')
        .isString()
        .isLength({min: 3, max: 50})
        .trim(),
        body('imageURL')
        .isURL(),
        body('price')
        .isFloat(),
        body('description')
        .isString()
        .isLength({min: 3, max: 400})
        .trim()
    ],
    adminController.postAddProduct
);

router.get(
    '/edit-product/:productId',
    isAuth,
    [
        body('title')
        .isString()
        .isLength({min: 3, max: 50})
        .trim(),
        body('imageURL')
        .isURL(),
        body('price')
        .isFloat(),
        body('description')
        .isString()
        .isLength({min: 3, max: 400})
        .trim()
    ],
    adminController.getEditProduct
    );

router.post(
    '/edit-product',
    isAuth,
    [
        body('title').isString().isLength({min: 3, max: 50}).trim(),
        body('imageURL').isURL(),
        body('price').isFloat(),
        body('description').isString().isLength({min: 3}).trim()
    ],
    adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports.routes = router;
