var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	role: {
		type: String,
		"default": "common" //admin, etc. to be determined
	},
	hash: String,
	salt: String
});

userSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function(password){
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	return this.hash === hash;
};

userSchema.methods.generateJwt = function(options){
	var expiration = {};
	var expiry = new Date();
	if(!options){
		expiration.minutes = 0,
		expiration.days = 7
	} else {
		expiration.minutes = options.minutes || 0,
		expiration.days = options.days || 0
	}
	console.log(expiration);
	console.log(typeof expiration.minutes)
	expiry.setDate(expiry.getDate() + expiration.days);
	expiry.setMinutes(expiry.getMinutes() + expiration.minutes);
	console.log(typeof parseInt(expiry.getTime() / 1000));
	return jwt.sign({
		_id: this._id,
		email: this.email,
		name: this.name,
		exp: parseInt(expiry.getTime() / 1000)
	}, process.env.JWT_SECRET);
};

mongoose.model('User', userSchema);