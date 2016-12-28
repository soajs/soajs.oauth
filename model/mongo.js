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
	
	"validateId": function (soajs, id, cb) {
		checkForMongo(soajs);
		
		var id1;
		try {
			id1 = mongo.ObjectId(id);
			return id1;
		}
		catch (e) {
			soajs.log.error(e);
			throw e;
		}
	},
	
	"findEntry": function (soajs, combo, cb) {
		checkForMongo(soajs);
		mongo.findOne(combo.collection, combo.condition || {}, combo.fields || null, combo.options || null, cb);
	},
	
	"removeEntry": function (soajs, combo, cb) {
		checkForMongo(soajs);
		mongo.remove(combo.collection, combo.condition, cb);
	}
	
};