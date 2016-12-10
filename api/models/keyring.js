var mongoose = require('mongoose');

var KeySchema = new mongoose.Schema({
	name: String,
	url: String,
	username: String,
	password: String
});

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