var crypto = require('crypto');

//todo : put in .env
var algorithm = process.env.CRYPTO_HELPER_ALG;
var password = process.env.CRYPTO_HELPER_PASSWORD;

module.exports.encryptPassword = function(text){
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