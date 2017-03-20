"use strict";
var Mongo = require ("soajs").mongo;
var mongo;

function checkForMongo(soajs) {
	if (!mongo) {
		mongo = new Mongo(soajs.registry.coreDB.provision);
	}
}

module.exports = {
	/**
	 * Validates the mongo object ID
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
	
	/**
	 * Find one entry based on a condition
	 * @param {SOAJS Object} soajs
	 * @param {Object} combo
	 * @param {Callback Function} cb
	 */
	"findEntry": function (soajs, combo, cb) {
		checkForMongo(soajs);
		mongo.findOne(combo.collection, combo.condition || {}, combo.fields || null, combo.options || null, cb);
	},
	
	/**
	 * Delete an entry from the database
	 * @param {SOAJS Object} soajs
	 * @param {Object} combo
	 * @param {Callback Function} cb
	 */
	"removeEntry": function (soajs, combo, cb) {
		checkForMongo(soajs);
		mongo.remove(combo.collection, combo.condition, cb);
	}
	
};