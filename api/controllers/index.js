var mongoose = require('mongoose');
var Key = mongoose.model('Key');
var Ring = mongoose.model('Ring');

var sendJSONresponse = function(res, status, content){
	res.status(status);
	res.json(content);
};

var errMessage = "Something went wrong"

module.exports.createKey = function(req, res){
	if(!req.body.name){
		return sendJSONresponse(res, 400, {
			"message": "Key name required"
		});
	}
	Ring.findOne({owner: res.locals.user._id}, function(err, ring){
		if(err){
			return sendJSONresponse(res, 400, {
				"message": err.message
			});
		}

		var key = {};

		key.name = req.body.name || '';
		key.url = req.body.url || '';
		key.username = req.body.username || '';
		key.password = req.body.password || '';

		ring.keys.push(key);

		ring.save(function(err, ring){
			if(err){
				return sendJSONresponse(res, 400, err);
			}

			return sendJSONresponse(res, 200, ring);
		});
	});
};

module.exports.getKeys = function(req, res){
	Ring.findOne({owner: res.locals.user._id}, function(err, ring){
		if(err){
			return sendJSONresponse(res, 400, {
				"message": err.message
			});
		}
		if(ring === null){
			return sendJSONresponse(res, 404, {
				"message": "Requested resource does not exist"
			});
		}

		return sendJSONresponse(res, 200, ring);
	});
};

module.exports.getKey = function(req, res){
	if(!req.params.keyId){
		return sendJSONresponse(res, 400, {
			"message": "Key id is required"
		});
	}
	Ring.findOne({owner: res.locals.user._id}, function(err, ring){
		if(err){
			return sendJSONresponse(res, 400, {
				"message": err.message
			});
		}
		// if(ring === null){
		// 	return sendJSONresponse(res, 404, {
		// 		"message": err.message
		// 	});
		// }

		var key = ring.keys.id(req.params.keyId);

		if(key === null){
			return sendJSONresponse(res, 404, {
				"message": "Requested resource not found"
			});
		}

		sendJSONresponse(res, 200, key);

	});
};

module.exports.updateKey = function(req, res){
	if(!req.params.keyId){
		return sendJSONresponse(res, 400, {
			"message": "Key id is required"
		});

	}

	Ring.findOne({owner: res.locals.user._id}, function(err, ring){
		if(err){
			return	sendJSONresponse(res, 400, {
				"message": err.message
			});
		}

		var key = ring.keys.id(req.params.keyId);
	
		if(key === null){
			return sendJSONresponse(res, 404, {
				"message": "Requested resource was not found"
			});
		}

		key.name = req.body.name || key.name;
		key.url = req.body.url || key.url;
		key.username = req.body.username || key.username;
		key.password = req.body.password || key.password;

		ring.save(function(err, ring){
			if(err){
				return sendJSONresponse(res, 400, {
					"message": err.message
				});
			}
			return sendJSONresponse(res, 200, ring);
		});

	})
};

module.exports.deleteKey = function(req, res){
	if(!req.params.keyId){
		return sendJSONresponse(res, 400, {
			"message": "Key id is required"
		});
	}

	Ring.findOne({owner: res.locals.user._id}, function(err, ring){
		if(err){
			return sendJSONresponse(res, 400, {
				"message": err.message
			});
		}

		if(ring.keys.id(req.params.keyId) === null){
			return sendJSONresponse(res, 400, {
				"message": "Delete failed, requested resource id does not exist"
			});
		}

		ring.keys.id(req.params.keyId).remove();
		ring.save(function(err, ring){
			if(err){
				return sendJSONresponse(res, 400, err);
			}
			return sendJSONresponse(res, 200, ring);
		})


	})
};

// var scraps = require('../models/scrap');

// module.exports.bulk = function(req, res){

// 	Ring.findOne({owner: res.locals.user._id}, function(err, ring){
// 		if(err){
// 			return sendJSONresponse(res, 200, {
// 				"message": err.message
// 			});
// 		}

// 		ring.keys = ring.keys.concat(scraps.applications);
// 		console.log(scraps.applications);
// 		ring.save(function(err, ring){
// 			if(err){
// 				return sendJSONresponse(res, 400, {
// 					"message": err.message
// 				});
// 			}
// 			return sendJSONresponse(res, 200, ring);
// 		});
// 	});
// }