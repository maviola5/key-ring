var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var sendJsonResponse = function(res, status, content){
	res.status(status);
	res.json(content);
};

var auth = function(req, res, next){
	if(!req.headers.authorization){
		return sendJsonResponse(res, 401, {"message": "Authorization is required" });
	}

	var token = req.headers.authorization.replace('Bearer ', '');
	jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
		if(err){
			valid = false;
			return sendJsonResponse(res, 401, {"message": err });
		}
		valid = true;
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

router.get('/bulkjob', auth, ctrlApp.bulk);

//404 Error catch
router.all('*', notFound);

module.exports = router;