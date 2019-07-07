"use strict";

const
  zmq = require('zmq'),
  filename = process.argv[2],
  // create request endpoint
  requester = zmq.socket('req');

requester.on('message', function(data){
  let response = JSON.parse(data);
  if (response.error) {
    return console.error(response.error);
  }
  
  console.log("Received response: ", response);
});

requester.connect('tcp://localhost:5433');

for(let i = 1; i <= 3; i++){
  console.log('Sending request ' + i + ' for ' + filename);
  requester.send(JSON.stringify({
    path: filename
  }));
}