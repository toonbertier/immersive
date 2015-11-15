'use strict';

let helpers = require('../helpers/helpers');

function Player(ctx) {
  this.ctx = ctx;
}

Player.prototype.play = function(sound, panning) {

  let sourceNode = this.ctx.createBufferSource();
  sourceNode.buffer = sound;

  let panNode = this.ctx.createStereoPanner();
  panNode.pan.value = panning;

  sourceNode.connect(panNode);
  panNode.connect(this.ctx.destination);

  sourceNode.start(0);

};

Player.prototype.calculatePanning = function(asteroidX, cameraX){
  let difference = asteroidX - cameraX;
  return helpers.mapRange(difference, -70, 70, -1, 1);
};

module.exports = Player
