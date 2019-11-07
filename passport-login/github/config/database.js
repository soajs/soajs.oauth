let mongoose = require('mongoose');

let chalk = require('chalk');

let dbURL = require('./props').DB;

let connected = chalk.bold.cyan;
let error = chalk.bold.yellow;
let disconnected = chalk.bold.red;
let termination = chalk.bold.magenta;

module.exports =function(){
	
	mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true});
	
	mongoose.connection.on('connected', function(){
		console.log(connected("Mongoose default connection is open to ", dbURL));
	});
	
	mongoose.connection.on('error', function(err){
		console.log(error("Mongoose default connection has occured "+err+" error"));
	});
	
	mongoose.connection.on('disconnected', function(){
		console.log(disconnected("Mongoose default connection is disconnected"));
	});
	
	process.on('SIGINT', function(){
		mongoose.connection.close(function(){
			console.log(termination("Mongoose default connection is disconnected due to application termination"));
			process.exit(0)
		});
	});
};