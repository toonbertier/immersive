'use strict';

function Star() {

	this.z = Math.random() * 300 - 150;
	this.x = Math.random() * 500 - 250;
	this.y = Math.random() * 300 - 150;

  this.transitionSpeed = 0.01;
  this.transitioning = false;

}

Star.prototype.render = function() {

	let starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
	let starMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
	this.el = new THREE.Mesh(starGeometry, starMaterial);

	this.el.position.z = this.z;
	this.el.position.x = this.x;
	this.el.position.y = this.y;
  this.el.material.transparent = true;
  this.el.material.opacity = 0;

	return this;

};

Star.prototype.update = function() {

  this.el.position.z += Math.random() * (0.07 - 0.05) + 0.05; //standard 0.06
  this.el.position.y += Math.random() * (0.11 - 0.09) + 0.09; //standard 0.1

  if(this.transitioning) {
    this.el.material.opacity += this.transitionSpeed;
    if(this.el.material.opacity === 1) this.transitioning = false;
  }

};

Star.prototype.checkOutOfBounds = function() {

  if(this.el.position.z > 400 || this.el.position.y > 200) {
    return true;
  }
  return false;

};



module.exports = Star;
