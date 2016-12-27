var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var redisClient = require('../models/redisClient');

var encryptToken = function(token){
	var hash = crypto.pbkdf2Sync(token, process.env.SALT, 1000, 64).toString('hex');
	return hash;
};

var sendJSONresponse = function(res, status, content){
	res.status(status);
	res.json(content);
};

/**
* Route middleware for verifying JWT. TODO: validatetoken payload
*/
module.exports = function(req, res, next){
	if(!req.headers.authorization){
		return sendJSONresponse(res, 401, {"message": "Authorization is required" });
	}

	var token = req.headers.authorization.replace('Bearer ', '');
	jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
		if(err){
			return sendJSONresponse(res, 401, {"message": err });
		}

		//get redis key => value and compare with JWT
		redisClient.get(decoded.email, function(err, reply){
			if(reply !== encryptToken(token)){
				return sendJSONresponse(res, 400, {
					"message": "Token invalid. Authentication is required."
				})
			}
			res.locals.user = decoded;
			next();
		});

	});
};