const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Product = require('./product');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: {type: mongoose.Types.ObjectId , required: true, ref: 'Product'},
                quantity: {type: Number, required: true}
            }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if(cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }else{
        updatedCartItems.push({ productId: product._id, quantity: newQuantity });
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.deleteItemFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });

    this.cart.items= updatedCartItems;
    return this.save();
};

userSchema.methods.addOrder = function() {


    return this.populate('cart.items.productId')
        .execPopulate()
        .then(products => {
            const order = {
                items: products,
                user: {
                    _id: new mongodb.ObjectId(this._id),
                    username: this.username
                }
            };
            return db.collection('orders').insertOne(order);
        })
        .then(result => {
            this.cart = { items: [] };
            return db
                .collection('users')
                .updateOne(
                    { _id: new mongodb.ObjectId(this._id) },
                    { $set: { cart: { items: [] } } }
                );
        })
};

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
};

module.exports = mongoose.model('User', userSchema);