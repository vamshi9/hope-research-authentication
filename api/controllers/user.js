const User = require('../models/user');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const async = require('async');
const nodemailer = require('nodemailer');
let transporter = require('../config/nodemailer');

/*GET Users */
exports.getUsers = (req, res, next) => {
    //res.render('login', {title: 'Login page'})
    User.find()
        .select('id email password')
        .exec()
        .then(users => {
            if (users.length < 1) {
                return res.status(500).json({
                    message: 'Sorry there are no users'
                })
            }
            console.log(users);
            res.status(200).json({
                users
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Damn, something went wrong dude!'
            });
        });
    //next();
}

/*REGISTER Users */
exports.registerUsers = (req, res, next) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {

            if (user.length >= 1) {
                //conflict with the existing database
                return res.status(409).json({
                    message: 'Sorry, bruh! One has to use their own shit'
                });
            } else {
                //console.log('entered')
                //hashing the password with salt-9
                bcrypt.hash(req.body.password, 9, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const token = jwt.sign({
                                email: req.body.email,
                                userId: req.body._id
                            },
                            process.env.JWT_KEY, {
                                expiresIn: '1hr'
                            }
                        )
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            username: req.body.username,
                            email: req.body.email,
                            password: hash,
                        });

                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User Created',
                                    token: token
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            });
                    }
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}

/*LOGIN Users */
exports.loginUsers = (req, res, next) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {

            if (user.length < 1) {
                return res.status(401).json({
                    message: 'There is no such user in our database, boy!',
                });
            }

            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Wrong username or password, dude'
                    })
                }
                if (result) {
                    const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY, {
                            expiresIn: '1hr'
                        }
                    )

                    return res.status(200).json({
                        message: 'Welcome to you page, macha!',
                        token: token
                    });
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Something went wrong dude!'
            });
        });
}

/*FORGOT PASSWORD */
exports.forgotPassword = (req, res, next) => {
    async.waterfall([
        (done) => {
            User.findOne({
                    email: req.body.email
                })
                .exec((err, user) => {
                    if (user) {
                        done(err, user);
                    } else {
                        done('sorry, dude! we did not find ya!');
                    }
                })
        },

        (user, done) => {

            const token = jwt.sign({
                    email: user.email,
                    userId: user._id
                },
                process.env.JWT_KEY, {
                    expiresIn: '1hr'
                },
                (err, token) => {
                    done(err, user, token);
                })
        },

        (user, token, done) => {
            User.updateOne({
                    _id: user._id
                }, {
                    reset_password_token: token,
                    reset_password_expires: Date.now() + 3600000,
                }, {
                    upsert: true,
                    new: true
                })
                .exec((err, new_user) => {
                    done(err, token, new_user)
                })
        },

        (token, user, done) => {
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"VK 👻" <bmikwwpaddsz4vze@ethereal.email>', // sender address
                to: req.body.email, // list of receivers
                subject: 'password reset ✔', // Subject line
                text: `hey ${user.username}! Please click below to reset you password
    localhost:7000/users/reset-password/:${token}`, // plain text body
                html: `<a href="localhost:7000/users/reset-password/:${token}">Password Reset</a>` // html body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                res.status(200).json({
                    message: 'Email has been sent!'
                })
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        }
    ], (err) => {
        return res.status(422).json({
            message: err
        });
    })

}

exports.updatePassword = (req, res, next) => {
    //ofcourse we can handle it with params
    const token = req.body.token;
    User.findOne({
            reset_password_token: token,
            reset_password_expires: {
                $gt: Date.now()
            }
        })
        .exec((err, user) => {
            console.log(user);
            if (!err && user) {
                if (req.body.newPassword === req.body.confirmPassword) {
                    user.hash_password = bcrypt.hashSync(req.body.newPassword, 9);
                    user.reset_password_token = undefined;
                    user.reset_password_expires = undefined;
                    user.save((err) => {
                        if (err) {
                            return res.status(500).json({
                                message: err
                            });
                        } else {
                            // setup email data with unicode symbols
                            let mailOptions = {
                                from: '"VK 👻" <bmikwwpaddsz4vze@ethereal.email>', // sender address
                                to: user.email, // list of receivers
                                subject: 'password reset confirmation', // Subject line
                                text: 'Password succesfully reset', // plain text body
                                html: `<a href="localhost:7000/">Login here</a>` // html body
                            };
                            // send mail with defined transport object
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                                console.log('Message sent: %s', info.messageId);
                                // Preview only available when sending through an Ethereal account
                                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                                res.status(200).json({
                                    message: 'Confirmation email has been sent!'
                                })
                                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                            });
                        }
                    })
                } else {
                    return res.status(500).json({
                        message: 'Passwords did not match'
                    });
                }
            } else {
                return res.status(500).json({
                    message: 'Password reset token is expired or invalid!'
                })
            }
        })

}