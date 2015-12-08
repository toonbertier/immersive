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

}

SpaceDebris.prototype.update = function() {

    this.el.position.z += 2;
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

module.exports = SpaceDebris;
