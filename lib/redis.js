

'use strict';

var config = require("../config");

var redis = require("redis");
var logger = require('tracer').colorConsole();
var client = redis.createClient(config.redis.port, config.redis.host);


// client.auth("1b75ca4b93c646ae:1CaZ5LEgx4J8QdMUyv5eUKNzgTUwep", redis.print)
var RedisNotifier = require('redis-notifier');

	
var eventNotifier = new RedisNotifier(redis, {
	redis : config.redis,
	expired : true,
	logLevel : 'DEBUG' //Defaults To INFO 
});




var zincrby = function(channelId, id, score){

	client.zincrby(channelId, score, id);
};

var decrement = function(channelId, id, score){

	zincrby(channelId, id, -score);

	client.del(channelId + "," + id + "," + score);
}; 

var increment = function(channelId, id, score, timeout){


	var key = generate() +","+ channelId + "," + id + "," + score + "," + timeout;

	zincrby(channelId + timeout, id, score);

	client.set(key, timeout);
	client.expire(key, timeout);
}; 


function process(key){

	var arr = key.split(",");

	var	channelId = arr[1], id = arr[2], score = arr[3] || 1;

	if(id){
		
		return decrement(channelId + arr[4], id, score);
	}
	
	logger.warn("key not found: " + key);
}	


eventNotifier.on('message', function(pattern, channelPattern, emittedKey) {
	var channel = this.parseMessageChannel(channelPattern);
	switch(channel.key) {
		case 'expired':
		process(emittedKey);
		break;
		logger.warn("Unrecognized Channel Type:" + channel.type);
	}
});



module.exports = {

	increment: increment,

	decrement: decrement,

	redis: client,

	cozrevrange: function(key, start, end){

		return (done)=>{

			client.zrevrange(key, start, end || 10, "WITHSCORES",(err, list)=>{

				var rankList = [], instance = {}, key = "";

				if(err) return done(null, []);

				list.forEach((item, i)=>{

					if(i % 2 == 0) key = item;
					else {

						instance[key] = item;

						rankList.push(instance);

						instance = {};
					}
				});

				done(null ,rankList);
			});

		};
	}

};


function generate(){

    var crypto = require('crypto');
    var shasum = crypto.createHash('sha1');

    shasum.update(String(Math.random()+Date.now()));

    var str = shasum.digest('hex');

    return String(str);
}

