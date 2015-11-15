'use strict';

let helpers = require('../helpers/helpers');
let BufferLoader = require('./BufferLoader');
let soundData = require('../../../assets/sounds/sounds.js');

function Player(ctx) {

  window.AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

  this.ctx = new AudioContext();

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

Player.prototype.calculatePanning = function(asteroidX, cameraX) {
  let difference = asteroidX - cameraX;
  return helpers.mapRange(difference, -70, 70, -1, 1);
};

Player.prototype.loadSoundData = function() {

  return new Promise((resolve, reject) => {
    let loader = new BufferLoader(this.ctx);
    loader.load(soundData).then(data => {
      return resolve(data);
    });
  });

};

module.exports = Player
