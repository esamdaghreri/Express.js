const express = require('express');
// Validation package
const { check, body } = require('express-validator/check');

const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user')

router.get('/login', authController.getLogin);

router.post('/login', 
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
        body(
            'password',
            'Invalid email or password'
        )
        .isLength({min: 5})
        .isAlphanumeric()
        .trim()
    ], 
    authController.postLogin
);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', 
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {req}) => {
            return User.findOne( { email: value } )
                .then(userDoc => {
                    if(userDoc){
                        return Promise.reject('E-mail is already exist!');
                    }
                });
        })
        .normalizeEmail(),
        body(
            'password',
            'Plase enter a password with only numbers and text and at least 5 characters.'
        )
        .isLength({min: 5})
        .isAlphanumeric()
        .trim(),
        body('confirmPassword')
        .trim()
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Password have to match!');
            }
            return true;
        })
    ], 
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);


module.exports = router;