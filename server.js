var express = require('express');
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var morgan =  require('morgan');
var User = require('./models/user');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');

var cartLen = require('./middleware/middleware');

var secret = require('./config/secret');



mongoose.connect(secret.database,function(err){
  if(err) {
    console.log(err);
  }
  else {
    console.log('connected successfully');
  }


});





var app = express();

//middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: secret.secretKey,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ url: secret.database, autoReconnect: true})
}));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
//   var messages = require('express-messages')(req, res);
//     res.locals.messages = function (chunk, context, bodies, params) {
//         return chunk.write(messages());
//     };
//     next();
// });

var Category = require('./models/category');


app.use(function(req,res,next){
  Category.find({},function(err, categories){
    if(err) return next(err);
    res.locals.categories = categories;
    next();
  });
});

app.use(function(req,res,next){
  res.locals.user = req.user;
  next();
});

app.use(cartLen);

app.engine('ejs', engine);
app.set('view engine', 'ejs');

var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api',apiRoutes);

app.listen(port, function(err) {
  if(err) throw err;
  console.log(`Server is running on port: ${port}` );
});
