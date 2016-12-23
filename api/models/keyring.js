var mongoose = require('mongoose');
var crypto = require('crypto');
var cryptoHelper = require('../config/cryptoHelper');

var KeySchema = new mongoose.Schema({
	name: String,
	url: String,
	username: String,
	password: String
});

KeySchema.methods.encryptPassword = cryptoHelper.encryptPassword;

KeySchema.methods.decryptPassword = cryptoHelper.decryptPassword;

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