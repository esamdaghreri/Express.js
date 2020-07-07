const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

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
        errorMessage: message
    });
};

module.exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne( {email: email} )
        .then(user => {
            if(!user){
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(match => {
                    if(match) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save((error) => {
                            console.log(error);
                            return res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid email or password');
                    res.redirect('/login');
                })
                .catch(error => {
                    console.log(error);
                })
        })
        .catch(error => {
            console.log(error);
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
        errorMessage: message
    });
};

module.exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmePassword = req.body.confirmePassword;

    User.findOne( { email: email } )
        .then(userDoc => {
            if(userDoc){
                req.flash('error', 'E-mail is already exist!');
                return res.redirect('/signup');
            }
            return bcrypt
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
                    return transporter.sendMail({
                        to: email,
                        from: 'esam@test.com',
                        subject: 'Signup Succeeded!',
                        html: '<h1>You successfully signed up!</h1>'
                    });
                })
                .catch(error => {
                    console.log(error);
                });
            })
        .catch(error => {
            console.log(error);
        });
};

module.exports.postLogout = (req, res, next) => {
    req.session.destroy((error) => {
        console.log(error)
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
            console.log(error);
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
                console.log(error);
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
            console.log(error);
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
            console.log(error);
        });
};