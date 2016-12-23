var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var cryptoHelper = require('../config/cryptoHelper');
var email = require('../controllers/email');


var sendJsonResponse = function(res, status, content){
	res.status(status);
	res.json(content);
};

var auth = function(req, res, next){
	if(!req.headers.authorization){
		req.session.destroy();
		return sendJsonResponse(res, 401, {"message": "Authorization is required" });
	}

	var token = req.headers.authorization.replace('Bearer ', '');
	jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
		if(err){
			req.session.destroy();
			return sendJsonResponse(res, 401, {"message": err });
		}

		//check if token is in session
		if(cryptoHelper.encryptPassword(token) !== req.session.token){
			req.session.destroy();
			return sendJsonResponse(res, 401, {"message": "Authorization is required"})
		}
		
		res.locals.user = decoded;
		next();
	});
};

var notFound = function(req, res){
	return sendJsonResponse(res, 404, {
		"message": "The requested resource doesn't exist"
	});
}

var ctrlApp = require('../controllers');
var ctrlAuth = require('../controllers/authentication');

//application CRUD
router.get('/key', auth, ctrlApp.getKeys);
router.get('/key/:keyId', auth, ctrlApp.getKey);
router.post('/key', auth, ctrlApp.createKey);
router.put('/key/:keyId', auth, ctrlApp.updateKey);
router.delete('/key/:keyId', auth, ctrlApp.deleteKey);

//auth api
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

//TODO: split the route with userid out to admin routes
router.get('/logout/:userid', ctrlAuth.logout);


/**
* BIG TODO: determine simple admin routes
*/
//admin routes

//make reset password route
//make onboarding route
//make admin user-dashboard
router.get('/emailtest', (req, res) => {
	// res.send('hello');
	var mailOptions = {
		from: '"Fred Foo" <foo@blurdybloop.com>',
		to: 'maviola5@gmail.com',
		subject: 'Hello'
	}

	email.sendMail(mailOptions, (error, info) => {
		if(error){
			console.log(error);
			return sendJsonResponse(res, 400, error);
		}
		sendJsonResponse(res, 200, {
			"message": info.response
		});
	});
})

// router.get('/bulkjob', auth, ctrlApp.bulk);

//404 Error catch
router.all('*', notFound);

module.exports = router;