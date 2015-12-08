'use strict';

let helpers = require('../helpers/helpers');


function SpaceDebris(x, y, z, model) {

  let deg = Math.random() * 20 + 80;
  let rad = helpers.toRadians(deg);

  this.x = x;
  this.y = y;
  this.z = z;
  this.rotationSpeed = 0.0005;

  this.el = model;
  this.el.position.set(x, y, z);
  this.el.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.geometry.computeBoundingBox();
      this.boundingBox = child.geometry.boundingBox;
      console.log(this.boundingBox);
    }
  });

}

SpaceDebris.prototype.update = function() {

    this.el.position.z += 5;
    this.el.rotation.x += 0.001;
    this.el.rotation.y += 0.005;

    if(this.checkOutOfBounds) {
      this.el.remove();
    }

};

SpaceDebris.prototype.checkOutOfBounds = function() {
  if(this.el.position.z > 500) {
    return true;
  }
  return false;
};

SpaceDebris.prototype.detectCollision = function(camera) {

  if(this.el.position.z > camera.position.z) {
    if(this.el.position.x - this.boundingBox.min.x < camera.position.x + 80
       && this.el.position.x + this.boundingBox.max.x > camera.position.x - 80) {
      return true;
    }
  }

  return false;

};

module.exports = SpaceDebris;
