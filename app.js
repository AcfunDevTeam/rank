

'use strict';


var koa    = require("koa"),
	mount  = require("koa-mount");



var app = koa();


var index  = require("./routes"),
	config = require("./config");


app.use(mount("/", index.middleware()));


app.listen(config.port);
