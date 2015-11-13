'use strict';

function Player(ctx) {
  this.ctx = ctx;
}

Player.prototype.play = function(sound) {
  let sourceNode = this.ctx.createBufferSource();
  sourceNode.buffer = sound;
  sourceNode.connect(this.ctx.destination);
  sourceNode.start(0);
}

module.exports = Player
