var router = require('express').Router();
var User = require('../models/user');
var flash = require('express-flash');
var passport = require('passport');
var passportConf = require('../config/passport');
var Cart = require('../models/cart');

var async = require('async');




router.get('/login', function(req,res){
  if(req.user){
  req.flash('success',`You are Loggedin Now. Welcome ${req.user.profile.name}! `);
  res.redirect('/profile');
  }
  res.render('accounts/login',{
    errors: req.flash('errors'),
    title: 'Login | Page'
  });
});


router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/profile',passportConf.isAuthenticated,function(req,res,next){
  User
    .findOne({ _id: req.user._id})
    .populate('history.item')
    .exec(function(err,found){
      if(err) return next(err);
      res.render('accounts/profile',{
        user:found,
        success: req.flash('success'),
        title: `Profile | ${req.user.profile.name}`
      });
    });
});


router.get('/signup', function(req,res){

  res.render('accounts/signup',{
    errors: req.flash('errors'),
    title: 'Signup | Page'

  });
});


router.post('/register', function(req,res,next) {

  async.waterfall([
    function(callback) {

      var email = req.body.email;
      var name = req.body.name;
      var password = req.body.password;


      User.findOne({
        email: email
      },function(err, existingUser) {
        if(existingUser) {
          req.flash('errors', 'Account with that email already exists.');
          res.redirect('/signup');

        }else {
          var user = new User({
            email: email,
            password: password,
            profile: {
              name: name
            }
            });

          user.profile.picture = user.gravatar();

          user.save(function(err){
            if(err) return next(err);
            callback(null, user);




          });
        }
      });

    },

    function(user) {
      var cart = new Cart({
        owner: user._id
      });
cart.save(function(err) {
  if(err) return next(err);
  req.logIn(user, function(err){
    if (err) return next(err);
    req.flash('success','You are logged in Now...');
    res.redirect('/profile');
  });

});
}


  ])


});


router.get('/logout',function(req,res, next){
  req.logout();
  res.redirect('/login');

});


router.get('/edit-profile', function(req,res,next){
  res.render('accounts/edit-profile',{
    success: req.flash('success'),
    user: req.user,
    title: 'Edit | Profile'
  });
});

router.post('/edit-profile', function(req,res,next){
User.findOne({_id: req.user._id},  function(err,user){
  if (err) return next(err);

  if(req.body.name) user.profile.name = req.body.name;
  if(req.body.address) user.profile.address = req.body.address;
  console.log(req.body.address);

  user.save(function(err){
    if(err) return next(err);
    req.flash('success','Successfully Edited your profile.');
    return res.redirect('/edit-profile');

  });

});
});


router.get('/auth/facebook', passport.authenticate('facebook',{scope: 'email'}));

router.get('/auth/facebook/callback', passport.authenticate('facebook',{
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

module.exports = router;
