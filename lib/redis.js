

'use strict';

var redis = require("redis");
var logger = require('tracer').colorConsole();
var client = redis.createClient(6379, "127.0.0.1");

// client.auth("1b75ca4b93c646ae:1CaZ5LEgx4J8QdMUyv5eUKNzgTUwep", redis.print)
var RedisNotifier = require('redis-notifier');

	
var eventNotifier = new RedisNotifier(redis, {
	redis : { host : '127.0.0.1', port : 6379 },
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


	var key = channelId + "," + id + "," + score;

	zincrby(channelId, id, score);

	console.log(channelId, id, score)

	client.set(key, timeout);
	client.expire(key, timeout);
}; 


function process(key){

	var arr = key.split(",");

	var	channelId = arr[0], id = arr[1], score = arr[2] || 1;

	if(id){
		
		return decrement(channelId, id, score);
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
				console.log(err, list)
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

