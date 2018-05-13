var router = require('express').Router();
var flash = require('express-flash');
var User = require('../models/user');
var Product = require('../models/product');
var Cart = require('../models/cart');
var async = require('async');
var passport = require('../config/passport');
var stripe = require('stripe') ('sk_test_4uZfQWDDLTOnbIJoC9dgk3CT');

router.post("/charge", (req, res) => {
  let amount = (req.body.amount)*100;
  stripe.customers.create({
     email: req.body.stripeEmail,
    source: req.body.stripeToken
  })
  .then(customer =>
    stripe.charges.create({
      amount,
      description: "Payment",
         currency: "usd",
         customer: customer.id
    }))
  .then((charge) => {
async.waterfall([
  function(callback) {
    Cart.findOne({ owner: req.user._id}, function(err, cart){
      callback(err,cart);
    });
  },
  function(cart, callback) {
User.findOne({_id: req.user._id}, function(err, user){
  if(user){
    for(var i = 0; i < cart.items.length; i++) {
      User.update({_id: user._id}, {
              $push:  { history: {
                paid: cart.items[i].price,
                item: cart.items[i].item
              }}}).then(function(hist){
          callback(err,hist);
             },function(e){
        res.send(e);
      });
    }
  }
});
  },
  function(user) {
    Cart.update({owner: req.user._id},{
      $set: {
        total: 0,
        items: []
      }
    }).then((go)=>{
      console.log(go);
      res.redirect('/profile');
    },(e)=>{
      res.status(400).send(e);
    });



    }


])


});
});




router.get('/test', function(req,res,next){
  var id = "5af705787ef00530584f3c08";
  var i = '5af4288a732dc824dccea64f';

  // Cart.findOne({owner : id  }).then((count)=>{
  //
  //   console.log(count);
  //   res.send(count);
  // },(e)=>{
  //   console.log(e);
  // });

// Cart.update({owner: id},{$set: {
//   total: 0
// }}
// ).then((cart)=>{
//
//   res.json(cart);
// },(e)=>{
//   res.json(e);
// });

Cart.update({owner: id},{
  $set: {
    total: 0,
    items: []
  }
}).then((go)=>{
  console.log(go);
});

// var price = 100;
//
//
// User.update({_id: id}, {
//         $push:  { history: {
//           paid: price,
//
//           item: id
//
//         }
//
//         }
//
//
//
// }).then((data)=>{

  User.find({
    _id: id
  }).then((cart)=>{




    res.json(cart);
  },(e)=>{
    res.json(e);
  });
// },(e)=>{
//   res.status(400).send(e);
// })





// Cart.update({ owner : id },{$pull: {items: { _id : i} }}).then((count)=>{
//
//   console.log(count);
//   res.send(count);
// },(e)=>{
//   console.log(e);
// });



});


function pagination(req,res,next){
  var perPage = 9;
  var page = req.params.page;

  Product
    .find()
    .skip(perPage * page)
    .limit(perPage)
    .populate('category')
    .exec(function(err, products){
      if(err) return next(err);
      Product.count().exec(function(err, count){
      if(err) return next(err);
      res.render('main/main-product' ,{
        products: products,
        pages: count / perPage,
        title: 'Welcome to Shop ♥'
      });
    });
  });
}


Product.createMapping( function(err, mapping) {
  if(err){
    console.log("Error create Mapping");
    console.log(err);
  }else{
    console.log("Mapping created");
    console.log(mapping);
  }
});

var stream = Product.synchronize();
var count = 0;

stream.on('data', function() {
count++;
});

stream.on('close', function() {
console.log("Indexed " + count + " Documents");
});

stream.on('error', function() {
console.log(err);
});


router.post('/product/:product_id', function(req,res,next){

  Cart.findOne({owner: req.user._id}, function(err, cart){
    console.log(cart);
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });

    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

    cart.save(function(err) {
      if(err) return next(err);
      return res.redirect('/cart');
    });
  });
});


router.get('/cart', function(req,res, next){
  if(req.user) {
    Cart
      .findOne({owner: req.user._id})
      .populate('items.item')
      .exec(function(err, foundCart) {

        if(err) return next(err);
        res.render('main/cart',{
          remove: req.flash('remove'),
          foundcart: foundCart,
          title: `Cart | ${req.user.profile.name}`
        });
      });
  } else {
    res.redirect('/login');
  }

});



router.post('/remove', function(req, res, next) {
  var price = parseFloat(req.body.price);

  Cart.update({ owner : req.user._id },{$pull: {items: { _id : req.body.item} }}).then((count)=>{
    Cart.findOne({ owner: req.user._id }).then((data)=>{


      var totalPrice = parseFloat(data.total);
      var total = totalPrice - price;
      Cart.update({ owner : req.user._id},{
        $set: {
          total : total
        }
      }).then((go)=>{
        req.flash('remove','Successfully Removed');
           res.redirect('/cart');

      },(e)=>{
        res.send(e);
      });


    },(e)=>{
      res.send(e);
    });

  },(e)=>{
    console.log(e);
  });

  // Cart.findOne({ owner: req.user._id}, function(err, foundCart) {
  //   console.log(foundCart);
  //
  //
  //   foundCart.items.pull(req.body.item);
  //
  //   foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
  //
  //   foundCart.save(function( err, found) {
  //     if(err) return next(err);
  //     req.flash('remove','Successfully Removed');
  //     res.redirect('/cart');



});


router.get('/', function(req,res,next){
  if(req.user) {
pagination(req,res,next);

  }else {
    res.render('main/home',{
      title: 'Welcome to Shop ♥'
    });
  }
});


router.get('/page/:page',function(req,res,next){
  var page = req.params.page;
  pagination(req,res,next);

});


router.post('/search', function(req,res,next){
  res.redirect('/search?q=' + req.body.q);
});

router.get('/search', function(req,res,next){
  if(req.query.q) {
    Product.search({
      query_string: {query: req.query.q}
    }, function(err,results) {
      console.log(results.hits.hits);
      if(err) return next(err);
      var data = results.hits.hits.map(function(hit){
        console.log('Data: ',hit);
        return hit;
      });
      res.render('main/search-result',{
        query: req.query.q,
        data: data,
        title: `Search | ${req.query.q}`
      });
    });
  }
});

router.get('/about', function(req,res,callback){
res.render('main/about');
});


router.get('/products/:id',function(req,res,next){
  Product
  .find({ category: req.params.id})
  .populate('category')
  .exec(function(err,products) {
    if(err) return next(err);

    res.render('main/category',{
      products: products,
      title: 'Product'
    });
  });
});

router.get('/product/:id', function(req,res,next){
  Product.findById({_id: req.params.id }, function(err,product) {
      if(err) return next(err);
      res.render('main/product',{
        product: product,
        title: 'Product'
      });
  });
});



module.exports = router;
