let Tasks = require('../model/dao');

exports.createTask = function (req, res, next) {
	let task = {
		name: req.body.name,
		description: req.body.description
	};
	
	Tasks.create(task, function(err, hero) {
		if(err) {
			res.json({
				error : err
			})
		}
		res.json({
			message : "Task created successfully"
		})
	})
};

exports.getTasks = function(req, res, next) {
	Tasks.get({}, function(err, tasks) {
		if(err) {
			res.json({
				error: err
			})
		}
		res.json({
			tasks: tasks
		})
	})
};

exports.updateTask = function(req, res, next) {
	let task = {
		name: req.body.name,
		description: req.body.description
	};
	
	Tasks.update({_id: req.params.id}, task, function(err, hero) {
		if(err) {
			res.json({
				error : err
			})
		}
		res.json({
			message : "Task updated successfully"
		})
	})
};

exports.removeTask = function(req, res, next) {
	Tasks.delete({_id: req.params.id}, function(err, hero) {
		if(err) {
			res.json({
				error : err
			})
		}
		res.json({
			message : "Task deleted successfully"
		})
	})
};