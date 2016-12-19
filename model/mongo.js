"use strict";
var core = require("soajs");
var Mongo = core.mongo;
var mongo;

function checkForMongo(soajs) {
	if (!mongo) {
		mongo = new Mongo(soajs.registry.coreDB.provision);
	}
}

module.exports = {

	"findEntry": function (soajs, combo, cb) {
		checkForMongo(soajs);
		mongo.findOne(combo.collection, combo.condition || {}, combo.fields || null, combo.options || null, cb);
	},
	
	"removeEntry": function (soajs, combo, cb) {
		checkForMongo(soajs);
		mongo.remove(combo.collection, combo.condition, cb);
	}
	
};