var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var crypto = require('crypto');


// The User Schema
var UserSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: {
    type:String
  },
  facebook : {
    type: String
  },
  
  tokens: {
    type: Array
  },
  profile: {
    name: {
      type: String,
      default: ''
      },
    picture: {
        type: String,
        default: ''
          },
    address: String
  },
  history: [{
    date: Date,
    payment: {
      type: Boolean,
      default: true
    },

    paid: {
      type: Number,
      default: 0
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  }]
});



//methods to hash password
UserSchema.pre('save', function(next){
  var user= this;
  if(!user.isModified('password')) return next();
  bcrypt.genSalt(10,function(err, salt){
    if (err) return next(err);
    bcrypt.hash(user.password, salt,null,function(err,hash){
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});


//compare password
UserSchema.methods.comparePassword =  function(password) {
  return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.gravatar = function(size) {
  if(!this.size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/'+ md5 + '?s=' + size + '&d=retro';
}

module.exports = mongoose.model('User', UserSchema);
