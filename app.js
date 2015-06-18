/*jshint node:true*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');
var http = require('http');
var path = require('path');
var morgan = require('morgan');
var mosca = require('mosca');
var fs = require('fs');
var https = require ('https');


var db;
var cloudant;
var dbCredentials = {
	dbName : 'my_sample_db'
};

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
// TODO var cfenv = require('cfenv');

	var port = (process.env.VCAP_APP_PORT || 3000);
	var host = (process.env.VCAP_APP_HOST || '0.0.0.0');

function initDBConnection() {
	
	if(process.env.VCAP_SERVICES) {
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		if(vcapServices.cloudantNoSQLDB) {
			dbCredentials.host = vcapServices.cloudantNoSQLDB[0].credentials.host;
			dbCredentials.port = vcapServices.cloudantNoSQLDB[0].credentials.port;
			dbCredentials.user = vcapServices.cloudantNoSQLDB[0].credentials.username;
			dbCredentials.password = vcapServices.cloudantNoSQLDB[0].credentials.password;
			dbCredentials.url = vcapServices.cloudantNoSQLDB[0].credentials.url;
		}
		console.log('VCAP Services: '+JSON.stringify(process.env.VCAP_SERVICES));
	}
    else{
            dbCredentials.host = "ffe37731-0505-4683-96a8-87d02a33e03e-bluemix.cloudant.com";
			dbCredentials.port = 443;
			dbCredentials.user = "ffe37731-0505-4683-96a8-87d02a33e03e-bluemix";
			dbCredentials.password = "c7003d0b156d9c4ce856c4e6b4427f3b576c7ea6229235f0369ada1ed47b159c";
			dbCredentials.url = "https://ffe37731-0505-4683-96a8-87d02a33e03e-bluemix:c7003d0b156d9c4ce856c4e6b4427f3b576c7ea6229235f0369ada1ed47b159c@ffe37731-0505-4683-96a8-87d02a33e03e-bluemix.cloudant.com";
        
    }

	cloudant = require('cloudant')(dbCredentials.url);
	
	//check if DB exists if not create
	cloudant.db.create(dbCredentials.dbName, function (err, res) {
		if (err) { console.log('could not create db ', err); }
    });
	db = cloudant.use(dbCredentials.dbName);
}

initDBConnection();
    

// create a new express server
var app = express();

app.set('port', port);
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
var userCount = 0;
app.get('/', function(req, res) {
    	userCount = userCount + 1;
        res.render('index', {userCount: userCount}); 
    });
    
    
var mqttServe = new mosca.Server({});

mqttServe.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});

mqttServe.on('published', function(packet, client){
	console.log('Published', packet);
	console.log('Topic', packet.topic);
	console.log('Message', packet.payload);
	console.log('Client', client);
	console.log('Message.toString', packet.payload.toString("utf8"));
	console.log('### Inside serve.On ###');

	fs.appendFile("../logs/mqtt.log", packet.topic + ": " + packet.payload.toString("utf8") + "\n", function(err) {
	    if(err) {
	        return console.log(err);
	    }	
	    console.log("The file was saved!");
	}); 
	
	db.insert({"Topic": packet.topic, "Message": packet.payload.toString("utf8")}, function(err, body) {
 		if (!err)
    		console.log(body);
		});

	

});

//// get the app environment from Cloud Foundry
//var appEnv = cfenv.getAppEnv();
//
//// start server on the specified port and binding host
//app.listen(appEnv.port, appEnv.bind, function() {
//
//	// print a message when the server starts listening
//  console.log("server starting on " + appEnv.url);
//});

var httpServer = http.createServer(app);
mqttServe.attachHttpServer(httpServer);



httpServer.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

