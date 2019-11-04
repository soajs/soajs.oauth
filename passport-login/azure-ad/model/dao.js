const mongoose = require('mongoose');

let tasksSchema = require('./tasks');

tasksSchema.statics = {
	create : function(data, cb) {
		let task = new this(data);
		task.save(cb);
	},
	
	get: function(query, cb) {
		this.find(query, cb);
	},
	
	update: function(query, updateData, cb) {
		this.findOneAndUpdate(query, {$set: updateData},{new: true}, cb);
	},
	
	delete: function(query, cb) {
		this.findOneAndDelete(query,cb);
	}
};

let tasksModel = mongoose.model('Tasks', tasksSchema);
module.exports = tasksModel;