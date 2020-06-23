const http = require('http');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const errorsController = require('./controllers/errors');
const sequelize = require('./util/database');
const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');



app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// Retrive a user from every request.
app.use((req, res, next) => {
    User.findByPk(1)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(error => {
        console.log(error);
    });
});

app.use('/admin', adminData.routes);
app.use(shopRoutes);
app.use(errorsController.get404);

// Association
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
sequelize
// .sync({ force: true }) // That will force the database to be delete all data if new table creted.
.sync()
.then(result => {
    return User.findByPk(1);
})
.then(user => {
    if(!user){
        return User.create({name: 'Esam Daghreri', email: 'esam@daghreri.com'});
    }
    return Promise.resolve(user);
})
.then(user => {
    return user.createCart();
})
.then(cart => {
    app.listen(3000);
})
.catch(error => {
    console.log(error);
});

console.log(User.toJSON());
console.log('=--=-=-=-')