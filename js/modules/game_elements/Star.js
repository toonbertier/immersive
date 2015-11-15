'use strict';

function Star() {
	this.z = Math.random() * 300 - 150;
	this.x = Math.random() * 500 - 250;
	this.y = Math.random() * 300 - 150;
}

Star.prototype.render = function() {

	let starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
	let starMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
	this.el = new THREE.Mesh(starGeometry, starMaterial);

	this.el.position.z = this.z;
	this.el.position.x = this.x;
	this.el.position.y = this.y;

	return this;

};

Star.prototype.update = function() {
  this.el.position.z += Math.random() * (0.07 - 0.05) + 0.05; //starndard 0.06
  this.el.position.y += Math.random() * (0.11 - 0.09) + 0.09; //starndard 0.1
};

Star.prototype.checkOutOfBounds = function() {

  if(this.el.position.z > 400 || this.el.position.y > 200) {
    return true;
  }
  return false;

};

module.exports = Star;
