var redis = require('redis');
var options = {
	host: '127.0.0.1',
	port: 6379
};

if(process.env.NODE_ENV === 'production'){
	options = {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
		password: process.env.REDIS_PASSWORD
	};
}

var redisClient = redis.createClient(options);

//Redis
redisClient.on('ready',function() {
	console.log("Redis connected to", options.host+':'+options.port);
});

redisClient.on('error',function() {
	console.log("Error in Redis");
});

module.exports = redisClient;