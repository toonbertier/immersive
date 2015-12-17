'use strict';

let helpers = require('../helpers/helpers');

function Asteroid(kind) {

  this.kind = kind;

  this.radius = Math.random() * (8 - 1) + 1;
  this.x = 0;
  this.y = 0;
	this.z = -400;
}

Asteroid.prototype.randomPointAroundCurrentDeg = function(currentDeg) {
  let deg = currentDeg + Math.random() * 20 - 10;
  let rad = helpers.toRadians(deg);

  this.x = 250 * Math.cos(rad);
  this.y = 250 * Math.sin(rad) - 250;
}

Asteroid.prototype.renderBig = function(obj, currentDeg) {
  this.el = obj;
  this.randomPointAroundCurrentDeg(currentDeg);
  this.el.position.set(this.x, this.y, this.z);
  return this.el;
}

Asteroid.prototype.renderSmall = function(currentDeg) {

	return new Promise((resolve, reject) => {

		let asteroidGeometry = new THREE.SphereGeometry(this.radius, 32, 32);
		let textureLoader = new THREE.TextureLoader();

		textureLoader.load('./assets/images/asteroid_bump.jpg', bump => {
			let asteroidMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
			asteroidMaterial.bumpMap = bump;
			asteroidMaterial.bumpScale = 10;

			this.el = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

			this.randomPointAroundCurrentDeg(currentDeg);

      this.el.position.set(this.x, this.y, this.z);

      this.el.material.transparent = true;
      this.el.material.opacity = 0;

			return resolve(this);

		});

	});

};

Asteroid.prototype.update = function() {

  switch(this.kind) {

    case "small":

      this.el.position.z += 4;
      this.el.rotation.x += 0.01;
      this.el.rotation.y += 0.005;
      if(this.el.material.opacity < 1) this.el.material.opacity += 0.1;

      this.checkPassing();

      break;

    case "big":

      this.el.position.z += 0.9;
      this.el.rotation.x += 0.01;
      this.el.rotation.y += 0.005;

      break;
  }

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
  if(this.el.position.z >= 340 && this.el.position.z <= 343) {
    window.bean.fire(this, 'passing');
  }
};

module.exports = Asteroid;
