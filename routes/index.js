
'use strict';

var Router = require("koa-router");
var redis  = require("../lib/redis");


var index  = new Router();

index.get("/increment/:channelId/:id/:score/:timeout", function*(){


	var p = this.params, type = p.type;

	
	redis.increment(p.channelId, p.id, p.score, p.timeout);

	this.body = { status: 0, msg: "success" };
});


index.get("/decrement/:channelId/:id/:score", function*(){


	var p = this.params, type = p.type;

	
	redis.decrement(p.channelId, p.id, p.score);

	this.body = { status: 0, msg: "success" };
});


index.get("/:channelId/:start/:end/:timeout", function*(){


	var p = this.params, type = p.type;



	this.body = yield redis.cozrevrange(p.channelId + p.timeout, p.start, p.end);
});


module.exports = index;
