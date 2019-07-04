"use strict";

const { EventEmitter } = require('events'),
  fs = require('fs'),
  { inherits } = require('util'),

FileWatcher = function(filename){
  EventEmitter.call(this);

  const self = this;
  // watcher setup
  let watcher = fs.watch(filename, function(){
    self.emit("changed", {
        type: "changed",
        filename: filename,
        timestamp: Date.now()
    });

  this.stop = function(){
    watcher.close();
  }
});
}

inherits(FileWatcher, EventEmitter);

module.exports = FileWatcher;