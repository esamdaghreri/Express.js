// Node library
const http = require('http');
const path = require('path');

// Third party library
const express = require('express');
const bodyParser = require('body-parser');
const mongoose =require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
var randomId = require('random-id');

// Export files
const errorsController = require('./controllers/errors');
const User = require('./models/user');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Init app
const app = express();

const MONGODB_URI = ''; // uri database connection

// Create sessions collection for store all sessions in database
const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();

// Create options for file storage
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, randomId(30, 'aA0') + '-' + file.originalname);
    }
});
// Filter files upload
const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//EJS
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));

// Middleware for recieve requests that has file upload
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image')); // image => is tha name if input filed

// Public Folder
app.use(express.static(path.join(__dirname, 'public')));
// Make static folder for images
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(session({
    secret: 'my secret hash key',
    resave: false,
    saveUninitialized: false,
    store: store
}));

// Get csrf token in all requrest
app.use(csrfProtection);
// Flash message using flash session
app.use(flash());

// Data will be available in view
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// If user is logged in, it will at a user information on each request
app.use((req, res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if(!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(error => {
            next(new Error(error));
        });
})

// Add all routes in app file. NOTE: The request go from top to buttom
app.use('/admin', adminRoutes.routes); // /admin => it means all admin route start with admin in url
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorsController.get500);
// Handle any link that not match any if midllewares
app.use(errorsController.get404);
// If any technical issues happens, this route error will run
app.use((error, req, res, next) => {
    // res.redirect('/500');
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
      });
});

// When database is connect, 
mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3000);
    })
    .catch(error => {
        console.log(error);
    });