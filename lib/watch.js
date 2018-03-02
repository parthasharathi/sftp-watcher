var EventEmitter = require('events').EventEmitter;
spawn = require('child_process').spawn,
errorCode= require('./errorcode.js');
function parseFilesDetails(data) {
	var fileList = [];
	if (typeof data == "string") {
		data.split("\n").forEach(function (rows) {
			var columns = parseRow(rows)
				if ((columns.length == 9) && (columns[7].match(/[0-2][0-9]:[0-9][0-9]/g) != null) && (/[a-z0-9]/ig.test(columns[8]))) {
					var lastExecuteHours = new Date(new Date() - (1000 * 60 * 60 * 24 * 1)),
					fileDate = new Date(columns[5] + " " + columns[6] + " " + columns[7] + " " + new Date().getFullYear());
					if (lastExecuteHours < fileDate) {
						fileList.push(columns[8]);
					}
				}
		});
		return fileList;
	} else {
		return false
	}

}

function parseRow(row) {
	if (typeof row != "string") {
		return false;
	} else {
		return row.split(/(\s+)/).filter(function (e) {
			return e.trim().length > 0;
		});
	}
}
var provider = function (cmd) {
	var event = new EventEmitter(),
	ls,
	fileListResult = [];

	ls = spawn('sh', ['-c', cmd]);
	ls.stdin.end('ls -halt');
	ls.stdout.on('data', function (data) {
		var parseFiles = parseFilesDetails(data.toString());
		if (parseFiles && parseFiles.length > 0) {
			fileListResult = fileListResult.concat(parseFiles)
		}
	});
	ls.stderr.on('data', function (data) {
		event.emit("error", data)
	});
	ls.on('error', function (error) {
		event.emit("error", error)
	});

	ls.on('close', function (code) {
		if (code == 0) {
			event.emit("data", fileListResult)
		} else {
			event.emit("error", "error : " + errorCode[code] || code)
		}
	});
	return event;
}

module.exports = provider;
