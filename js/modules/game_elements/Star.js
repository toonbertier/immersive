'use strict';

function Star(){
	this.z = Math.random() * 300 - 150;
	this.x = Math.random() * 500 - 250;
	this.y = Math.random() * 300 - 150;
}

Star.prototype.render = function(){

	let starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
	let starMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
	this.el = new THREE.Mesh(starGeometry, starMaterial);

	this.el.position.z = this.z;
	this.el.position.x = this.x;
	this.el.position.y = this.y;
	
	return this.el;

};

module.exports = Star;
