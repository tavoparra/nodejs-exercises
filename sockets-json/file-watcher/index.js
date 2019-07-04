'use strict';

const
    net = require('net'),
    FileWatcher = require('./file-watcher'),
    filename = process.argv[2];

if(!filename) {
    throw Error("No target file was specified");
}

const fileWatcher = new FileWatcher(filename);

const server = net.createServer(function(connection){
    connection.write(JSON.stringify({
        type: "watching",
        filename: filename
    }) + "\n");

    fileWatcher.on('changed', function(data){
        connection.write(JSON.stringify(data) + "\n");
    })

    connection.on("close", function() {
        console.log("Subscriber disconnected");
    });
});

server.listen(3641, function() {
    console.log("listening for subscribers...");
});
