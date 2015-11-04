'use strict';

let fsp = require('fs-promise');

function BufferLoader(ctx) {
  this.ctx = ctx;
}

BufferLoader.prototype.decode = function(buffer) {
  return new Promise((resolve, reject) => {
    this.ctx.decodeAudioData(buffer, data => {
      if(!data) return reject(new Error('error while decoding'));
      return resolve(data);
    });
  }); 
}

BufferLoader.prototype.loadBuffer = function(url) {
  return fsp.readFile(url).then(data => this.decode(data.buffer));
}

BufferLoader.prototype.load = function(list) {
  this.list = list;

  return new Promise((resolve, reject) => {

    let _arr = [];

    this.list.forEach(item => {
      _arr.push(this.loadBuffer(item.file, item.name));
    });

    Promise.all(_arr)
      .then(arr => resolve(arr))
      .catch(err => reject(err));

  });
}

module.exports = BufferLoader;