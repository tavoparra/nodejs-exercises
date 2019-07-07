'use strict';

const
  cluster = require('cluster'),
  zmq = require('zmq'),
  PORT = 3645;
  
if(cluster.isMaster){
  let
    totalWorkers = 3,
    readyWorkers = 0,
    router = zmq.socket('router').bind(`http://127.0.0.1:${PORT}`),
    pusher = zmq.socket('push').bind('ipc://filer-pusher.ipc'),
    puller = zmq.socket('pull').bind('ipc://filer-puller.ipc');

    const sendJobs = function(){
      for(let i = 0; i < 30; i++){
        pusher.send(JSON.stringify({
          details: "details about this job"
        }));
      }
    }

    puller.on('message', function(data){
      const response = JSON.parse(data.toString());
      switch(response.type) {
        case 'ready':
          console.log()
          readyWorkers++;
          if (readyWorkers === totalWorkers) {
            sendJobs();
          }
          break;
        case 'result':
          console.log(`Message from worker ${response.worker}: ${response.message}`);
          break;
      }
    });

    for (let i = 0; i < totalWorkers; i ++){
      cluster.fork();
    }
} else {
  let
    puller = zmq.socket('pull').connect('ipc://filer-pusher.ipc'),
    pusher = zmq.socket('push').connect('ipc://filer-puller.ipc');

    puller.on('message', function(data){
      let response = JSON.parse(data.toString());
      pusher.send(JSON.stringify({
        type: 'result',
        message: response.details,
        worker: process.pid
      }))
    });

    pusher.send(JSON.stringify({
      type: 'ready'
    }));
}