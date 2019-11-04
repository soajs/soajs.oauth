const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let tasksSchema = new Schema({
	name :{
		type: String,
		unique : false,
		required : true
	},
	description : {
		type: String,
		unique : false,
		required : true
	}
});

module.exports = tasksSchema;