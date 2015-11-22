'use strict';

let helpers = require('../helpers/helpers');

function Robot() {
  this.x = 0;
  this.y = 0;
  this.z = 400;
  this.deg = 0;
  this.speed = 0;

  this.lasers = [];
  this.alternateCannon = false;

  this.isShaking = false;
  this.shakedFrames = 0;
};

Robot.prototype.createCamera = function() {

  this.camera = new THREE.PerspectiveCamera(50, 1440/720 , 1, 100000);
  this.camera.position.z = this.z;
  this.camera.position.x = this.x;

  return this.camera;

};

Robot.prototype.createLaser = function() {

  let laserGeometry = new THREE.BoxGeometry(2, 2, 10);
  let laserMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
  let laser = new THREE.Mesh(laserGeometry, laserMaterial);

  if(this.alternateCannon) {
    laser.position.x = this.x - 20;
  } else {
    laser.position.x = this.x + 20;
  }
  this.alternateCannon = !this.alternateCannon;

  laser.position.y = this.y - 20;
  laser.position.z = 350;

  this.lasers.push(laser);

  return laser;

};

Robot.prototype.shakeCamera = function() {

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

Robot.prototype.moveCamera = function() {

  let newDeg = this.deg + this.speed;

  if(newDeg > -70 && newDeg < 70) {
    this.deg = newDeg;
  }

  let rad = helpers.toRadians(this.deg);

  this.x = 250 * Math.sin(rad);
  this.y = 250 * Math.cos(rad) - 250;

  this.camera.rotation.z += ((-rad - this.speed * 0.4) - this.camera.rotation.z) * 0.2;

  this.camera.position.x += (this.x - this.camera.position.x) * 0.2;
  this.camera.position.y += (this.y - this.camera.position.y) * 0.2;

};

Robot.prototype.moveLasers = function() {

  this.lasers.forEach(laser => {

    if(laser.position.z < -100) {
      window.bean.fire(this, 'removeLaser', [laser]);
      helpers.removeFromArray(this.lasers, this.lasers.findIndex(l => l.uuid == laser.uuid));
      return;
    }

    laser.position.z -= 8;
  });

};

module.exports = Robot;