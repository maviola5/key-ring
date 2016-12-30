var express = require('express');
var router = express.Router();
var routeGuard = require('../controllers/routeGuard');

var sendJsonResponse = function(res, status, content){
	res.status(status);
	res.json(content);
};

var notFound = function(req, res){
	return sendJsonResponse(res, 404, {
		"message": "The requested resource doesn't exist"
	});
}

var ctrlApp = require('../controllers');
var ctrlAuth = require('../controllers/authentication');

//application api
router.get('/key', routeGuard, ctrlApp.getKeys);
router.get('/key/:keyId', routeGuard, ctrlApp.getKey);
router.post('/key', routeGuard, ctrlApp.createKey);
router.put('/key/:keyId', routeGuard, ctrlApp.updateKey);
router.delete('/key/:keyId', routeGuard, ctrlApp.deleteKey);

//user api
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.get('/logout', routeGuard, ctrlAuth.logout);
router.post('/resetemail', ctrlAuth.resetEmail);
router.post('/setpassword', routeGuard, ctrlAuth.setPassword);

/**
* BIG TODO: determine simple admin routes
*/
//admin routes
//make reset password route
//make onboarding route
//make admin user-dashboard

// router.get('/bulkjob', auth, ctrlApp.bulk);

//404 Error catch
router.all('*', notFound);

module.exports = router;