'use strinct';

const
    fs = require('fs'),
    net = require('net'),
    filename = process.argv[2],

server = net.createServer(function(connection){
    connection.write(JSON.stringify({
        type: "watching",
        file: filename
    }) + "\n"); 

    // watcher setup
    let watcher = fs.watch(filename, function(){
        connection.write(JSON.stringify({
            type: "changed",
            filename: filename,
            timestamp: Date.now()
        }), + "\n");
    });

    connection.on("close", function() {
        console.log("Subscriber disconnected");
        watcher.close();
    });

});

if(!filename) {
    throw Error("No target file was specified");
}

server.listen(3641, function() {
    console.log("listening for subscribers...");
});
