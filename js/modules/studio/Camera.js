'use strict';

let helpers = require('../helpers/helpers');

function Camera() {

  //camera
  this.el = new THREE.PerspectiveCamera(50, 1440/720 , 1, 100000);
  this.el.position.z = 400;
  this.el.position.x = 0;

  this.isShaking = false;
  this.shakedFrames = 0;
  this.x = 0;
  this.y = 0;
  this.deg = 0;
  this.speed = 0;

  //laser
  let geometry = new THREE.BoxGeometry(200, 10, 10);
  let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  this.laser = new THREE.Mesh(geometry, material);

  this.laser.position.x = this.el.position.x;
  this.laser.position.y = this.el.position.y;
  this.laser.position.z = 300;

  this.laser.rotation.y = 100;
  this.laser.rotation.x = 20;

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

  let newDeg = this.deg + this.speed;

  if(newDeg > -70 && newDeg < 70) {
    this.deg = newDeg;
  }

  let rad = helpers.toRadians(this.deg);

  this.x = 250 * Math.sin(rad);
  this.y = 250 * Math.cos(rad) - 250;

  this.el.rotation.z += ((-rad - this.speed * 0.4) - this.el.rotation.z) * 0.2;

  this.el.position.x += (this.x - this.el.position.x) * 0.2;
  this.el.position.y += (this.y - this.el.position.y) * 0.2;

  this.laser.position.x = this.el.position.x;
  this.laser.position.y = this.el.position.y;

};

Camera.prototype.renderLaser = function() {



};

module.exports = Camera;
