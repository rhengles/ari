var node_path = require('path');
var cp = require('child_process');

function getGitUserName(cb) {
	var child = cp.exec('git config --global user.name', {windowsHide:true}, cb);
}
function getGitUserEmail(cb) {
	var child = cp.exec('git config --global user.email', {windowsHide:true}, cb);
}

getGitUserName(function(err, name, message) {
	if (err) {
		console.log('name', err, message);
		return;
	}
	getGitUserEmail(function(err, email, message) {
		if (err) {
			console.log('email', err, message);
			return;
		}
		console.log('Name: '+name.replace(/^\s+|\s+$/g,''));
		console.log('Email: '+email.replace(/^\s+|\s+$/g,''));
	});
});
