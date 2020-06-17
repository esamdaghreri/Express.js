const Product = require('../models/product');

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {pageTitle: 'Add Product', path: '/admin/add-product'});
}

module.exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageURL = req.body.imageURL;
    const price = req.body.price;
    const description = req.body.description;
    // But null for first parameter because is new product and it will create new one not update a particular product.
    const product = new Product(null, title, imageURL, price, description);
    product.store();
    res.redirect('/');
}

module.exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId, product => {
        if(!product){
            res.redirect('/');
        }
        res.render('admin/edit-product', {product: product, pageTitle: 'Edit Product', path: '/admin/edit-product'});
    })
}

module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const imageURL = req.body.imageURL;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(productId, title, imageURL, price, description);
    product.store();
    res.redirect('/admin/products');
}

module.exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
        res.render('admin/product-list', {prods: products, pageTitle: 'Products', path: '/admin/products'});
    });
}

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId);
    res.redirect('/admin/products');
}