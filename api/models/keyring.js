var mongoose = require('mongoose');
var crypto = require('crypto');
var crypto = require('crypto');
var algorithm = process.env.CRYPTO_HELPER_ALG;
var password = process.env.CRYPTO_HELPER_PASSWORD;

module.exports.encryptPassword = function(text){
	this.salt = crypto.randomBytes(16).toString('hex');
	var cipher = crypto.createCipher(algorithm, password);
	var crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
};

module.exports.decryptPassword = function(text){
	var decipher = crypto.createDecipher(algorithm, password);
	var dec = decipher.update(text, 'hex', 'utf8');
	dec += decipher.final('utf8');
	return dec;
};

var KeySchema = new mongoose.Schema({
	name: String,
	url: String,
	username: String,
	hash: String,
	salt: String
});


//http://www.levigross.com/2014/03/30/how-to-write-an-encrypt-and-decrypt-api-for-data-at-rest-in-nodejs/
// FIX THIS MADNESS!!!!

KeySchema.methods.encryptPassword = function(text){
	this.salt = crypto.randomBytes(256).toString('utf8');
	var pepper = this.salt;
	var cipher = crypto.createCipher(algorithm, pepper);
	var crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	this.hash = crypted;
};

KeySchema.methods.decryptPassword = function(text, salt){
	var pepper = salt + password;
	var decipher = crypto.createDecipher(algorithm, pepper);
	var dec = decipher.update(text, 'hex', 'utf8');
	dec += decipher.final('utf8');
	return dec;
}	

var RingSchema = new mongoose.Schema({
	owner: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		unique: true,
		required: true
	},
	keys: [KeySchema] 
});

mongoose.model('Key', KeySchema);
mongoose.model('Ring', RingSchema);