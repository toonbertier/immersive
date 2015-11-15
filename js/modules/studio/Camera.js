'use strict';

function Camera() {

  this.el = new THREE.PerspectiveCamera(50, 1440/720 , 1, 100000);
  this.el.position.z = 400;
  this.el.position.x = 0;

  this.isShaking = false;
  this.shakedFrames = 0;
  this.x = 0;
  this.y = 0;

}

Camera.prototype.shake = function() {

  if(!this.isShaking) this.isShaking = true;

  if(this.shakedFrames < 120) {
   this.shakedFrames++;
   if(this.shakedFrames % 10 == 0) {
     this.x = Math.random() * (120 - this.shakedFrames) - ((120 - this.shakedFrames)/2);
     this.y = Math.random() * ((120 - this.shakedFrames) - ((120 - this.shakedFrames)/2)) / 2;
   }
  } else {
   this.shakedFrames = 0;
   this.y = 0;
   this.isShaking = false;
  }

};

Camera.prototype.move = function() {
  this.el.position.x += (this.x - this.el.position.x) * 0.05;
  this.el.position.y += (this.y - this.el.position.y) * 0.05;
};

module.exports = Camera;
