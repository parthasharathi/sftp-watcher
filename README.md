# Sftp-watcher

<p align="">
    <img height="200" width="400" src="https://i.imgur.com/gqMIfOj.jpg">
</p>

Configuration
--------------------------------------------------------------------------
* sftp-watcher supports only linux environment.
* Make sure your machine has sshpass 

     	sudo apt-get install sshpass
Scope of Sftp-watcher.
--------------------------------------------------------------------------
* Light weight.
* monitoring the directory.
SampleCode
--------------------------------------------------------------------------

	var sftpwatcher=require("sftp-watcher");                             

	var event=new sftpwatcher({
		host : 'your.hostname.com',
		port : 22,
		username : 'username',
		password : 'password',
		path : 'test/'
	});

	event.on("upload",function(data){
		console.log(data)
	});
	event.on("delete",function(data){
		console.log(data)
	});
	event.on("heartbeat",function(data){
		console.log(data.toString())
	});
	event.on("close",function(data){
		console.log(data.toString())
	});
	event.on("error",function(data){
		console.log(data.toString())
	});

TODO:

* Support windows as well
