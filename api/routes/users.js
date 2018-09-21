var express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('/mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function (req, res, next) {
  User.find()
    .select('id email password')
    .exec()
    .then(users => {
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
});


router.post('/signup', (req, res, next) => {
  User.find({
    email: req.body.email
  })
  .exec()
  .then(user => {
    
    if(user.length >= 1){
      //conflict with the existing database
      return res.status(409).json({
        message: 'Sorry, bruh! One has to use their own shit'
      });
    }

    //hashing the password with salt-9
    bcrypt.hash(req.body.password, 9, (err, hash) => {
      if(err){
        return res.status(500).json({
          error: err
        });
      }else{
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          username: req.body.username,
          email: req.body.email,
          password: hash
        });

        user.save()
            .then(result => {
              console.log(result);
              res.status(201).json({
                message: 'User Created'
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
  
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    })
  })
})


router.post('/login', (req, res, next) => {
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
});


router.post('/forgot-password', (req, res, next) => {
  res.render('forgot', {
    title: 'forgot'
  });
})

module.exports = router;