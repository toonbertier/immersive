'use strict';

function Earth() {
	this.z = 300;
	this.x = 0;
	this.y = -220;
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
				this.el.position.z = this.z;
				this.el.position.x = this.x;
				this.el.position.y = this.y;

				return resolve(this);
			});
		});

	});

};

Earth.prototype.update = function() {
	this.el.rotation.x += 0.0005;
};

module.exports = Earth;
