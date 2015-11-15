'use strict';

let helpers = require('../helpers/helpers');

function Earth(x, y, z) {

	this.position = {x, y, z};
  this.target = {};
  this.inverseSpeed = 100;
  this.moving = false;

}

Earth.prototype.render = function() {

	return new Promise((resolve, reject) => {

		let earthGeometry = new THREE.SphereGeometry(190, 64, 64);
		let textureLoader = new THREE.TextureLoader();

		textureLoader.load('./assets/images/earth_map.png', texture => {
			textureLoader.load('./assets/images/earth_bump.jpg', bump => {
				let earthMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
				earthMaterial.map = texture;
				earthMaterial.bumpMap = bump;
				earthMaterial.bumpScale = 10;

				this.el = new THREE.Mesh(earthGeometry, earthMaterial);
				this.el.position.x = this.position.x;
        this.el.position.y = this.position.y;
        this.el.position.z = this.position.z;

				return resolve(this);
			});
		});

	});

};

Earth.prototype.update = function() {

	this.el.rotation.x += 0.0005;

  if(this.moving) {

    this.el.position.x += (this.target.position.x - this.el.position.x) / this.inverseSpeed;
    this.el.position.y += (this.target.position.y - this.el.position.y) / this.inverseSpeed;
    this.el.position.z += (this.target.position.z - this.el.position.z) / this.inverseSpeed;

    if(helpers.distanceBetweenPoints(this.el.position, this.target.position) < 2) this.moving = false;

  }

};

Earth.prototype.moveTo = function(x, y, z) {
  this.target.position = {x, y, z};
  this.moving = true;
};

module.exports = Earth;
