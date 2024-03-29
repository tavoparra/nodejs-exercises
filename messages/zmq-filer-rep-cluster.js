'use strict';
const
  cluster = require('cluster'),
  fs = require('fs'),
  zmq = require('zmq');

if (cluster.isMaster) {

  // master process - create ROUTER and DEALER sockets, bind endpoints
  let
    router = zmq.socket('router').bind('tcp://127.0.0.1:5433'),
    dealer = zmq.socket('dealer').bind('ipc://filer-dealer.ipc');

  // forward messages between router and dealer
  router.on('message', function(){
    let frames = Array.prototype.slice.call(arguments);
    dealer.send(frames);
  });

  dealer.on('message', function(){
    let frames = Array.prototype.slice.call(arguments);
    router.send(frames);
  });

  cluster.on('online', function(worker) {
    console.log('Worker ' + worker.process.pid + ' is online.');
  });

  for (let i = 0; i < 3; i++) {
    cluster.fork();
  }
} else {
  // worker process -  create REP socket, connect to DEALER
  let responder = zmq.socket('rep').connect('ipc://filer-dealer.ipc');

  responder.on('message', function(data){
    // parse incoming message
    let request = JSON.parse(data);
    console.log(process.pid + ' received request for: ' + request.path);

    fs.readFile(request.path, function(err, data){
      if(err) {
        return responder.send(JSON.stringify({
          pid: process.pid,
          error: 'An error ocurred while requesting the file: ' + err.message,
          timestamp: Date.now()
        }));
      }

      console.log(process.pid + ' sending response');
      responder.send(JSON.stringify({
        pid: process.pid,
        data: data.toString(),
        timestamp: Date.now()
      }));
    });

    // close the responder when the Node process ends
    process.on('SIGINT', function(){
      console.log('Shutting down');
      responder.close();
    });
  });
}