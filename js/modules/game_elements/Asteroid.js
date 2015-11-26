'use strict';

let helpers = require('../helpers/helpers');

function Asteroid() {

  let deg = Math.random() * 40 + 70;
  let rad = helpers.toRadians(deg);

	this.z = -400;
  this.x = 250 * Math.cos(rad);
  this.y = 250 * Math.sin(rad) - 250;
	// this.x = Math.random() * 80 - 40;
	// this.y = 0;
	this.radius = Math.random() * (8 - 1) + 1;

}

Asteroid.prototype.render = function() {

	return new Promise((resolve, reject) => {

		let asteroidGeometry = new THREE.SphereGeometry(this.radius, 32, 32);
		let textureLoader = new THREE.TextureLoader();

		textureLoader.load('./assets/images/asteroid_bump.jpg', bump => {
			let asteroidMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
			asteroidMaterial.bumpMap = bump;
			asteroidMaterial.bumpScale = 10;

			this.el = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
			this.el.position.z = this.z;
			this.el.position.x = this.x;
			this.el.position.y = this.y;
      this.el.material.transparent = true;
      this.el.material.opacity = 0;

			return resolve(this);

		});

	});

};

Asteroid.prototype.update = function() {

	this.el.position.z += 6;
	this.el.rotation.x += 0.01;
	this.el.rotation.y += 0.005;
  if(this.el.material.opacity < 1) this.el.material.opacity += 0.1;

  this.checkPassing();

};

Asteroid.prototype.detectCollision = function(cameraPosition) {

  if(cameraPosition.z < this.el.position.z + this.el.geometry.boundingSphere.radius/2) {
    if(cameraPosition.x > this.el.position.x - this.el.geometry.boundingSphere.radius/2
       && cameraPosition.x < this.el.position.x + this.el.geometry.boundingSphere.radius/2 ) {
      return true;
    }
  }
  return false;

};

Asteroid.prototype.checkOutOfBounds = function() {
  if(this.el.position.z > 500) {
    return true;
  }
  return false;
};

Asteroid.prototype.checkPassing = function() {
  if(this.el.position.z >= 214 && this.el.position.z <= 216) {
    window.bean.fire(this, 'passing');
    player.play(soundFX[1]);
  }
};

module.exports = Asteroid;
