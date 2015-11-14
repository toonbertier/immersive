'use strict';

function Asteroid(){

	this.z = -500;
	this.x = Math.random() * 80 - 40;
	this.y = Math.random() * 20 - 10;
	this.radius = Math.random() * (8 - 1) + 1;

}

Asteroid.prototype.render = function(){

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

      bean.fire(this, 'test');

			return resolve(this);

		});

	});

};

Asteroid.prototype.update = function(){
	this.el.position.z += 3;
	this.el.rotation.x += 0.01;
	this.el.rotation.y += 0.005;
};

module.exports = Asteroid;
