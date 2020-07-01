const http = require('http');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const errorsController = require('./controllers/errors');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');



app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// Retrive a user from every request.
app.use((req, res, next) => {
    User.findById('5efb4651478de9ce43a4b311')
        .then(user => {
            req.user = new User(user.username, user.email, user.cart, user._id);
            next();
        })
        .catch(error => {
            console.log(error);
        });
});

app.use('/admin', adminData.routes);
app.use(shopRoutes);
app.use(errorsController.get404);

mongoConnect( () => {
    app.listen(3000);
});