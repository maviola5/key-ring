var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ring = mongoose.model('Ring');
var cryptoHelper = require('../config/cryptoHelper');
var redis = require('redis');
var redisClient = redis.createClient();


var sendJsonResponse = function(res, status, content){
	res.status(status);
	res.json(content);
}

module.exports.register = function(req, res){
	if(!req.body.name || !req.body.email || !req.body.password || !req.body.repassword) {
		return sendJsonResponse(res, 400, {
			"message": "All fields required"
		});
	}

	if(req.body.password !== req.body.password){
		return sendJsonResponse(res, 400, {
			"message": "Your passwords do not match. Please re-enter matching passwords."
		});
	}

	var user = new User();

	user.name = req.body.name;
	user.email = req.body.email;

	user.setPassword(req.body.password);

	user.save(function(err, user){
		var token;
		if(err){
			return sendJsonResponse(res, 400, {
				"message": err.message
			});
		}

		token = user.generateJwt();

		//set session key
		req.session.key = cryptoHelper.encryptPassword(token);
		// redisClient.set(user.email, req.session.id);

		Ring.create({owner: user._id}, function(err, ring){
			if(err){
				return sendJsonResponse(res, 400, {
					"message": err.message
				});

				//todo roll back user if ring doesnt create
			}
		});
		return sendJsonResponse(res, 201, { "token": token });
	});
};

module.exports.login = function(req, res){
	if(!req.body.email || !req.body.password){
		return sendJsonResponse(res, 400, {
			"message": "All fields required"
		});
	}
	passport.authenticate('local', function(err, user, info){
		var token;
		if(err){
			return sendJsonResponse(res, 400, err);
		}
		if(user){
			token = user.generateJwt();

			req.session.token = cryptoHelper.encryptPassword(token);
			redisClient.set(user.email, 'sess:'+req.session.id);
			return sendJsonResponse(res, 200, {
				"token": token,
				"session": req.session
			});
		} else {
			return sendJsonResponse(res, 401, info);
		}
	})(req, res);
};

module.exports.logout = function(req, res){
	if(req.params.userid){
		User.findById(req.params.userid, function(err, user){
			if(err){
				return sendJsonResponse(res, 400, {
					"message": err
				});
			}
			req.session.destroy();
			var sessionHash = redisClient.get(user.email);
			redisClient.del(user.email);
			redisClient.del(sessionHash);
		});

		return sendJsonResponse(res, 200, {
			"message": "logout successful"
		});
	}
	req.session.destroy(function(err){
		if(err){
			return console.log(err);
		}
	});

	return sendJsonResponse(res, 200, {
		"message": "user logged out"
	});
}