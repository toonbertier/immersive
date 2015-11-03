'use strict';

let ipc = require('ipc');

let stars = [];
let earth, asteroid;
let camera, scene, renderer, effect;

// ipc.on('move', function(val){
// 	camera.position.x = (val - 1017) / 10;
// });

const createEarth = () => {
	let earthGeometry = new THREE.SphereGeometry(190, 64, 64);

	let textureLoader = new THREE.TextureLoader();

	textureLoader.load('./assets/earth_map.png', texture => {
		textureLoader.load('./assets/earth_bump.jpg', bump => {
			let earthMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
			earthMaterial.map = texture;
			earthMaterial.bumpMap = bump;
			earthMaterial.bumpScale = 10;

			earth = new THREE.Mesh(earthGeometry, earthMaterial);

			earth.position.z = 300;
			earth.position.x = 0;
			earth.position.y = -220;

			scene.add(earth);
		});
	});

};

const createStar = () => {
	let starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
	let starMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
	let star = new THREE.Mesh(starGeometry, starMaterial);
	
	star.position.z = Math.random() * 150;
	star.position.x = Math.random() * 500 - 250;
	star.position.y = Math.random() * 300 - 150;

	scene.add(star);

	return star;
};

const createAsteroid = () => {
	let asteroidGeometry = new THREE.SphereGeometry(40, 32, 32);

	let textureLoader = new THREE.TextureLoader();

	textureLoader.load('./assets/asteroid_bump.jpg', bump => {
		console.log('bump loaded');
		let asteroidMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
		asteroidMaterial.bumpMap = bump;
		asteroidMaterial.bumpScale = 10;

		asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

		asteroid.position.z = 120;
		asteroid.position.x = 0;
		asteroid.position.y = 0;

		scene.add(asteroid);
	});
}

const removeOutOfBoundsStar = (star) => {
	if(star.position.z > 400 || star.position.y > 200) {
		scene.remove(star);
		stars.remove(stars.findIndex(s => s.uuid == star.uuid));
		return true;
	}
	return false;
};

const render = () => {
	requestAnimationFrame(render);
	effect.render(scene, camera);

	if(earth) {
		earth.rotation.x += 0.0005;
	}

	stars.forEach(star => {
		star.position.z += 0.2;
		star.position.y += 0.1;
		if(removeOutOfBoundsStar(star)){
			stars.push(createStar());
		}
	});
};

const init = () => {
	camera = new THREE.PerspectiveCamera(50, 1360/540 , 1, 100000);
	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(1360, 540);
	document.body.appendChild(renderer.domElement);

	effect = new THREE.AnaglyphEffect(renderer);
	effect.setSize(1360, 540);

	let light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 1, 1 ).normalize();
	scene.add(light);

	camera.position.z = 400;

	for(let i = 0; i < 300; i++) {
		stars.push(createStar());
	}
	createAsteroid();
	createEarth();

	render();
};

init();