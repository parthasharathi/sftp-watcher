
# Sftp-watcher

<p align="">
    <img height="200" width="400" src="https://i.imgur.com/gqMIfOj.jpg">
</p>
		SSFTP watcher helps to monitor the SFTP directory and tigger corresponding event. It's easy to start and stop process at any time.
		
Configuration
--------------------------------------------------------------------------
* install package

		npm install sftp-watcher

SampleCode
--------------------------------------------------------------------------

	var SftpWatcher = require("sftp-watcher");                            
	
	var event = new SftpWatcher({
			host : 'your.hostname.com',
			port : 22,
			username : 'username',
			password : 'password',
			path : 'test/'
		});
		
	event.on("upload", function (data) {
		console.log(data)
	});
	event.on("delete", function (data) {
		console.log(data)
	});
	event.on("heartbeat", function (data) {
		console.log(data.toString())
	});
	event.on("close", function (data) {
		console.log(data.toString())
	});
	event.on("error", function (data) {
		console.log(data.toString())
	});

    /*To stop the watcher*/

    event.emit("stop");