var EventEmitter = require('events').EventEmitter,
    Client = require('ssh2').Client;

module.exports = function(config) {
    var event = new EventEmitter(),
        timeinterval,
        fileWatcher;
    event.on("stop", function() {
        clearInterval(timeinterval);
        event.emit("close", "SFTP watcher stopped");
    });
    if (!config.host && !config.username) {
        //return "Invalid input";
        event.emit("error", "Invalid input");
    } else {
        event.emit('heartbeat', true);
        var conn = new Client();
        conn.on('ready', function() {
            conn.sftp(function(err, sftp) {
                if (err) {
                    event.emit('error', err.message || err);
                } else {
                    event.emit('connected', true);
                    fileWatcher(sftp, config.path);
                }
            });
        }).on('error', function(err) {
            event.emit('error', err.message || err);
        }).connect(config);
    };
    fileWatcher = function(sftp, folder) {
        var job = function(baseObjList) {
                folderObjList = {};
                sftp.readdir(folder, function(err, objList) {
                    if (err) {
                        event.emit('error', err.message || err);
                    } else {
                        if (baseObjList === null) {
                            objList.forEach(function(fileObj) {
                                folderObjList[fileObj.filename] = fileObj;
                            });
                        } else {
                            objList.forEach(function(fileObj) {
                                if (!baseObjList[fileObj.filename] || (baseObjList[fileObj.filename] && fileObj.attrs.size != baseObjList[fileObj.filename].attrs.size)) {
                                    fileObj.status = "uploading";
                                } else if (baseObjList[fileObj.filename].status == "uploading") {
                                    if (fileObj.attrs.size == baseObjList[fileObj.filename].attrs.size) {
                                        delete fileObj.status;
                                        event.emit("upload", {
                                            host: config.host,
                                            user: config.username,
                                            folder: config.path,
                                            file: fileObj
                                        });
                                    }
                                }
                                folderObjList[fileObj.filename] = fileObj;
                            });


                        }
                        if (baseObjList && Object.keys(baseObjList).length != 0) {
                            Object.keys(baseObjList).forEach(function(filename) {
                                if (!folderObjList[filename]) {
                                    event.emit("delete", {
                                        host: config.host,
                                        user: config.username,
                                        folder: config.path,
                                        file: baseObjList[filename]
                                    });
                                }
                            });
                        }
                    }
                });
            },
            folderObjList = null;
        timeinterval = setInterval(function() {
            new job(JSON.parse(JSON.stringify(folderObjList)));
            event.emit('heartbeat', new Date());
        }, 2000);

    };
    return event;
};