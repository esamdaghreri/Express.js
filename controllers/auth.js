const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
// This package get error when add validation in route folder
const { validationResult } = require('express-validator/check');

const crypto = require('crypto');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '' // API key
    }
}));

module.exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    }else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: {email: ""},
        validationErrors: []
    });
};

module.exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        // 422 is status false for validation
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {email: email},
            validationErrors: errors.array()
        });
    }

    User.findOne( {email: email} )
        .then(user => {
            if(!user){
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    oldInput: {email: email},
                    validationErrors: [{param: 'email'}]
                });
            }
            bcrypt.compare(password, user.password)
                .then(match => {
                    if(match) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save((error) => {
                            return res.redirect('/');
                        });
                    }
                    res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    oldInput: {email: email},
                    validationErrors: [{param: 'email'}]
                    });
                })
                .catch(error => {
                    res.redirect('/login');
                })
        })
        .catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
};

module.exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    }else {
        message = null;
    }

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: {email: ""},
        validationErrors: []
    });
};

module.exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        // 422 is status false for validation
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {email: email},
            validationErrors: errors.array()
        });
    }

    bcrypt
        .hash(password, 12)
        .then(hashPassword => {
            const user = new User({
                email: email,
                password: hashPassword,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            // return transporter.sendMail({
            //     to: email,
            //     from: 'esam@test.com',
            //     subject: 'Signup Succeeded!',
            //     html: '<h1>You successfully signed up!</h1>'
            // });
        })
        .catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        })
};

module.exports.postLogout = (req, res, next) => {
    req.session.destroy((error) => {
        res.redirect('/');
    });
};

module.exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    }else {
        message = null;
    }

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
};

module.exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (error, buffer) => {
        if(error) {
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then(user => {
                if(!user) {
                    req.flash('error', 'No account with that email found.');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save()
                    .then(result => {
                        res.redirect('/');
                        return transporter.sendMail({
                            to: req.body.email,
                            from: 'esam@test.com',
                            subject: 'Passaword reset',
                            html: `
                                <p>You requested a password reset</p>
                                <p>Click this link to set a new password.</p>
                                <a href="http://localhost:3000/reset/${token}"></a>
                            `
                        });
                    })
            })
            .catch(error => {
                const err = new Error(error);
                err.httpStatusCode = 500;
                return next(err);
            });
    });
};

module.exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            let message = req.flash('error');
            if(message.length > 0) {
                message = message[0];
            }else {
                message = null;
            }
        
            res.render('auth/password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
};

module.exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(error => {
            const err = new Error(error);
            err.httpStatusCode = 500;
            return next(err);
        });
};