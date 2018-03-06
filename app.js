var Watcher = require("./lib/watch.js"),
EventEmitter = require('events').EventEmitter,
dns = require('dns');

var api = function (config) {
	var event = new EventEmitter(),
	timeinterval;
	if (!config.host && !config.username) {
		return "Invalid input";
	} else {
		event.emit('heartbeat', true)
		dns.lookup(config.host, function (err, ipaddress) {
			if (err) {
				event.emit("error", err);
			} else {
				config.port = config.port || 22;
				var uploadFilesList = [],
				backupFileList = [],
				sshpassCmd = (config.password) ? "sshpass -p " + config.password + " " : "",
				sftpCmd = sshpassCmd + "sftp -oPort=" + config.port + " " + config.username + "@" + ipaddress + ":" + config.path || "";
				var job = function (firstping) {
					event.emit('heartbeat', true)
					var watcherEvent = new Watcher(sftpCmd);
					watcherEvent.on("data", function (data) {
						if (firstping == true) {
							backupFileList = data;
						} else {
							data.forEach(function (filename) {
								if (backupFileList.indexOf(filename) == -1) {
									event.emit("upload", {
										host : config.host,
										user : config.username,
										folder : config.path,
										fileName : filename
									});
								}
							});
							backupFileList.forEach(function (filename) {
								if (data.indexOf(filename) == -1) {
									event.emit("delete", {
										host : config.host,
										user : config.username,
										folder : config.path,
										fileName : filename
									});
								}
							});
							backupFileList = data;
						}
					});
					watcherEvent.on("close", function (data) {
						event.emit("close", data);
						clearInterval(timeinterval);
					});
					watcherEvent.on("error", function (data) {
						if (!data.toString().match("Connected to " + ipaddress + ".")) {
							event.emit("error", String(data));
							clearInterval(timeinterval);
						}
					});
				}
				event.on("stop",function(){
					clearInterval(timeinterval);
					event.emit("close", "Sftp Watcher stopped");
				});
				job(true);
				timeinterval = setInterval(job, 5000);
			}
		});
	}
	return event;

}
module.exports = api;
