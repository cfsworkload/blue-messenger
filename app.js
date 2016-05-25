// Copyright (c) 2016 IBM Corp. All rights reserved.
// Use of this source code is governed by the Apache License,
// Version 2.0, a copy of which can be found in the LICENSE file.

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');
var http = require('http');
var mosca = require('mosca');
var fs = require('fs');
var optional = require('optional');
var appEnv = require('cfenv').getAppEnv({vcap: optional('./local-vcap.json')});

var db;
var cloudant;

var dbCredentials = appEnv.services.cloudantNoSQLDB[0].credentials; // first instance with this label

dbCredentials.dbName = 'my_sample_db';

//setup cloudant db
function initDBConnection() {
	cloudant = require('cloudant')(dbCredentials.url);
	
	//check if DB exists if not create
	cloudant.db.create(dbCredentials.dbName, function (err, res) {
		if (err && err.statusCode === 412) { return console.log('OK: db already existed', dbCredentials.dbName); }
		if (err) { return console.log('could not create db ', err); }
    });
	db = cloudant.use(dbCredentials.dbName);
}

initDBConnection();
    

// create a new express server
var app = express();

app.set('appEnv', appEnv); // save the appEnv for later use
app.set('port', appEnv.port);
app.set('view engine', 'ejs');


// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See 
// http://expressjs.com/api#app-settings for more details.
app.enable('trust proxy');

// Add a handler to inspect the req.secure flag (see 
// http://expressjs.com/api#req.secure). This allows us 
// to know whether the request was via http or https.
app.use (function (req, res, next) {
	if (req.secure) {
		// request was via https
		res.redirect('http://' + req.headers.host + req.url);
	} else {
		// request was via http
		next();
	}
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));


/**
 * This is our home route.  This gets called when we visit our
 * base address http://MYSERVERNAME.mybluemix.net/
**/
app.get('/', function(req, res) {
        res.sendfile(__dirname + '/public/index.html');
    });

app.use('/i18n', require('./i18n-router')(appEnv).router);

// Create the MQTT server    
var mqttServe = new mosca.Server({});

mqttServe.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});

mqttServe.on('published', function(packet, client){

	console.log('Message: ', packet.payload.toString("utf8"));
	var logfile = appEnv.isLocal ? "mqtt.log" : "../logs/mqtt.log";
	fs.appendFile(logfile, packet.topic + ": " + packet.payload.toString("utf8") + "\n", function(err) {
	    if(err) {
	        return console.log(err);
	    }	
	}); 
	
	db.insert({"Topic": packet.topic, "Message": packet.payload.toString("utf8")}, function(err, body) {
 		if (!err)
    		console.log(body);
		});

});


//Create http server and attach the MQTT server to the websocket
var httpServer = http.createServer(app);
mqttServe.attachHttpServer(httpServer);


//begin listening
httpServer.listen(app.get('port'), appEnv.bind, function(){
  console.log('Express server listening on ' + appEnv.url);
});

