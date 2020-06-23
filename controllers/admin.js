const Product = require('../models/product');

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {pageTitle: 'Add Product', path: '/admin/add-product'});
}

module.exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageURL = req.body.imageURL;
    const price = req.body.price;
    const description = req.body.description;

    req.user.createProduct({ // creteProduct comes from the relation that has been create in app.js.
        title: title,
        price: price,
        imageURL: imageURL,
        description: description
    }).then(result => {
        console.log(result);
        res.redirect('/products');
    }).catch(error => {
        console.log(error);
    });
}

module.exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    req.user
        .getProducts({ where: {id: productId}})
        .then(products => {
            if(!products[0]){
                res.redirect('/');
            }
            res.render('admin/edit-product', {product: products[0], pageTitle: 'Edit Product', path: '/admin/edit-product'});
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
    Product.findByPk(productId).then(product => {
        product.title = title;
        product.price = price;
        product.imageURL = imageURL;
        product.description = description;
        return product.save();
    }).then(result => {
        console.log('Updated successfully!');
        res.redirect('/admin/products');
    }).catch(error => {
        console.log(error);
    });
}

module.exports.getProducts = (req, res, next) => {
    req.user
        .getProducts()
        .then(products => {
            res.render('admin/product-list', {prods: products, pageTitle: 'Products', path: '/admin/products'});
        }).catch(error => {
            console.log(error);
        });
}

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findByPk(productId).then(product => {
        return product.destroy();
    }).then(resutl => {
        console.log('Product has been destroyed!');
        res.redirect('/admin/products');
    }).catch(error => {
        console.log(error);
    });
}