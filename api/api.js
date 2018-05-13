var router = require('express').Router();
var async = require('async');
var faker = require('faker');
var Category = require('../models/category');
var Product = require('../models/product');


router.post('/search',function(req,res,next){
console.log(req.body.search_term);
  Product.search({
    query_string: { query: req.body.search_term }
  }, function(err, results) {
    if (err) return next(err);
    Category.find({}, function(err, allcategory) {
      if (err) return next(err);

      res.json({
        categories: allcategory,
        search: results
      });

  });
});
});



router.get('/:name',function(req,res,next){
  async.waterfall([
    function(callback){
      Category.findOne({ name: req.params.name},function(err,categori){
        if(err) return next(err);
        console.log(categori);
        callback(null, categori)
      });
    },
    function(categori, callback) {
        for(var i =0; i< 30; i++) {
          var product = new Product();
          product.category = categori._id;
          product.name = faker.commerce.productName();
          product.price = faker.commerce.price();
          product.image = faker.image.image();

          product.save();
        }
    }
  ]);
  res.json({message: 'success'});
});

module.exports = router;
