var mongoose = require('mongoose');
var crypto = require('crypto');

var algorithm = 'aes-256-ctr';
var password = 'youDaBaddestDudeInTown';

var KeySchema = new mongoose.Schema({
	name: String,
	url: String,
	username: String,
	password: String
});

KeySchema.methods.encryptPassword = function(text){
	var cipher = crypto.createCipher(algorithm, password);
	var crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
};

KeySchema.methods.decryptPassword = function(text){
	var decipher = crypto.createDecipher(algorithm, password);
	var dec = decipher.update(text, 'hex', 'utf8');
	dec += decipher.final('utf8');
	return dec;
};

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