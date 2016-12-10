var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ring = mongoose.model('Ring');

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

module.exports.login = function(req, req){
	if(!req.body.email || !req.body.password){
		return sendJsonResponse(res, 400, {
			"message": "All fields required"
		});
	}

	passport.authenticate('local', function(err, user, info){
		var token;
		if(err){
			sendJsonResponse(res, 400, err);
		}
		if(user){
			token = user.generateJwt();
			return sendJsonResponse(res, 200, {
				"token": token
			});
		} else {
			return sendJsonResponse(res, 401, info);
		}
	})(req, res);
};