'use strinct';

const
    fs = require('fs'),
    net = require('net'),
    filename = process.argv[2],

server = net.createServer(function(connection){
    connection.write("Now watching file " + filename +  " for changes...\n"); 

    // watcher setup
    let watcher = fs.watch(filename, function(){
        connection.write("file " + filename +  " has changed: " + Date.now() + "\n");
    });

    connection.on("close", function() {
        console.log("Subscriber disconnected");
        watcher.close();
    });

});

if(!filename) {
    throw Error("No target file was specified");
}

//server.listen(3641, function() {
    //console.log("listening for subscribers...");
//});
server.listen('/tmp/watcher.sock', function(){
    console.log("listening for subscribers...");
});
