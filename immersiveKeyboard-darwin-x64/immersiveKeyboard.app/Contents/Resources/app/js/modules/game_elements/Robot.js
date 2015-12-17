'use strict';

let helpers = require('../helpers/helpers');

function Robot() {
  this.x = 0;
  this.y = 0;
  this.z = 400;
  this.deg = 90;
  this.speed = 0;

  this.lasers = [];

  this.isShaking = false;
  this.shakedFrames = 0;
};

Robot.prototype.createCamera = function() {

  this.camera = new THREE.PerspectiveCamera(50, 1440/720 , 1, 100000);
  this.camera.position.z = this.z;
  this.camera.position.x = this.x;

  return this.camera;

};

Robot.prototype.createLaser = function(cannon) {

  let laserGeometry = new THREE.BoxGeometry(0.6, 0.6, 5);
  let laserMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
  let laser = new THREE.Mesh(laserGeometry, laserMaterial);

  laser.position.z = 400;
  let laserDeg;

  if(cannon == 'left') {
    laserDeg = this.deg + 1.5;
    laser.cannon = 'left';
  } else {
    laserDeg = this.deg - 1.5;
    laser.cannon = 'right';
  }

  let rad = helpers.toRadians(laserDeg);

  laser.position.x = 250 * Math.cos(rad);
  laser.position.y = 250 * Math.sin(rad) - 250;

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

  if(newDeg > 20 && newDeg < 160) {
    this.deg = newDeg;
  }

  let rad = helpers.toRadians(this.deg);

  this.x = 250 * Math.cos(rad);
  this.y = 250 * Math.sin(rad) - 250;

  this.camera.rotation.z += (((rad - Math.PI / 2) + this.speed * 0.4) - this.camera.rotation.z) * 0.2;
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

Robot.prototype.detectLaserColliction = function(collisionObj) {

  let radius = null;
  let collided = false;

  if(collisionObj.type == "Mesh") {
    radius = collisionObj.geometry.boundingSphere.radius;
  }

  for(let i = 0; i < this.lasers.length; i++) {
    let laser = this.lasers[i];
    if(laser.position.z < collisionObj.position.z + radius
       && laser.position.z > collisionObj.position.z - radius
       && laser.position.x < collisionObj.position.x + radius
       && laser.position.x > collisionObj.position.x - radius
       && laser.position.y < collisionObj.position.y + radius
       && laser.position.y > collisionObj.position.y - radius
    ) {
      collided = true;
      break;
    }
  }

  if(collided) {
    return true;
  }
  return false;

};

module.exports = Robot;
