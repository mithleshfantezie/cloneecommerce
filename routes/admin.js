var router = require('express').Router();
var Category = require('../models/category');
var flash = require('express-flash');

router.get('/add-category', function(req,res,next){
  res.render('admin/add-category',{
    success: req.flash('success'),
    title: 'Add | Category'
  });
});

router.post('/add-category', function(req,res,next){
  var category = new Category();
  category.name = req.body.name;

  category.save(function(err){
    if(err) return next(err);
    req.flash('success','Successfully added a category');
    return res.redirect('/add-category');
  });

});

module.exports = router;
