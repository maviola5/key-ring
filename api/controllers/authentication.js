var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ring = mongoose.model('Ring');
var crypto = require('crypto');
var redisClient = require('../models/redisClient');
var email = require('./email');
var jwt = require('jsonwebtoken');

var sendJsonResponse = function(res, status, content){
	res.status(status);
	res.json(content);
}

//one way encryption
var encryptToken = function(token){
	var hash = crypto.pbkdf2Sync(token, process.env.SALT, 1000, 64).toString('hex');
	return hash;
};

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
		//set user hash in Redis
		redisClient.set(user.email, encryptToken(token), function(err, reply){
			if(err){
				console.log(err);
			}
		});

		Ring.create({owner: user._id}, function(err, ring){
			if(err){
				return sendJsonResponse(res, 400, {
					"message": err.message
				});
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
			//set user hash in Redis
			redisClient.set(user.email, encryptToken(token), function(err, reply){
				if(err){
					console.log(err);
				}
				return sendJsonResponse(res, 200, {
					"token": token
				});
			});
		} else {
			return sendJsonResponse(res, 401, info);
		}
	})(req, res);
};

module.exports.logout = function(req, res){
	//remove user hash from Redis
	redisClient.del(res.locals.user.email, function(err, reply){
		if(err){
			console.log(err);
		}
		return sendJsonResponse(res, 200, {
			"message": "user logged out"
		});
	});
}

module.exports.resetEmail = function(req, res){
	if(!req.body.email){
		return sendJsonResponse(res, 400, {
			"message": "Email address is required"
		});
	}
	//TODO: validate user input
	var userEmail = req.body.email;
	User.findOne({email: userEmail}, function(err, user){
		if(err){
			return sendJsonResponse(res, 400, {
				"message": err
			});
		}
		var token = user.generateJwt();
		//todo: refactor this code
		var mailOptions = {
			from: '"Key Ring" <tviola202@gmail.com>',
			to: user.email,
			subject: 'Password reset',
			html: 'Click <a href="http://localhost:3000/resetpassword/'+ token +'">here</a> to reset your password.'
		}
		console.log('token :', token);
		console.log('encryptToken :', encryptToken(token));
		// console.log('', token)
		redisClient.set(user.email, encryptToken(token), function(err, reply){
			if(err){
				console.log(err);
			}
			console.log(mailOptions);
			email.sendMail(mailOptions, (error, info) => {
				if(error){
					console.log(error);
					return sendJsonResponse(res, 400, error);
				}
				return sendJsonResponse(res, 200, {
					"message": info.response
				});
			});
		});
	});
}

module.exports.setPassword = function(req, res){
	if(!req.body.password || !req.body.repassword){
		return sendJsonResponse(res, 400, {
			"message": "password and repassword are required"
		});
	}
	if(req.body.password !== req.body.repassword){
		return sendJsonResponse(res, 400, {
			"message": "password and repassword do not match"
		})
	}
	var password = req.body.password;
	//todo: validate user input
	User.findOne({email: res.locals.user.email}, function(err, user){
		if(err){
			return sendJsonResponse(res, 400, err);
		}
		user.setPassword(password);
		user.save(function(err, user){
			if(err){
				return sendJsonResponse(res, 400, err);
			}

			var token = user.generateJwt();

			redisClient.set(user.email, encryptToken(token), function(err, reply){
				if(err){
					sendJsonResponse(res, 400, err);
				}
				return sendJsonResponse(res, 200, {
					"message": "Password reset succuessful",
					"token": token
				})
			});
		});
	});
}