'use strict';

// ----- helpers/util

// Array Remove - By John Resig (MIT Licensed)
const removeFromArray = (arr, from, to) => {
  var rest = arr.slice((to || from) + 1 || arr.length);
  arr.length = from < 0 ? arr.length + from : from;
  return arr.push.apply(arr, rest);
};

const mapRange = (value, low1, high1, low2, high2) => {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};

// ------

let ipc = require('ipc');

let stars = [];
let earth, asteroid, asteroidRadius;
let camera, scene, renderer, effect;
let cameraX = 0, cameraY = 0;
let cameraIsShaking = false, shakedFrames;

// CREATING SCENERY

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

const createAsteroid = () => {
	asteroidRadius = 5;
	let asteroidGeometry = new THREE.SphereGeometry(asteroidRadius, 32, 32);

	let textureLoader = new THREE.TextureLoader();

	textureLoader.load('./assets/asteroid_bump.jpg', bump => {
		let asteroidMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
		asteroidMaterial.bumpMap = bump;
		asteroidMaterial.bumpScale = 10;

		asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

		asteroid.position.z = -500;
		asteroid.position.x = Math.random() * 80 - 40;
		asteroid.position.y = Math.random() * 20 - 10;

		scene.add(asteroid);
	});
};

const getStar = () => {
	let starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
	let starMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
	let star = new THREE.Mesh(starGeometry, starMaterial);
	
	star.position.z = Math.random() * 300 - 150;
	star.position.x = Math.random() * 500 - 250;
	star.position.y = Math.random() * 300 - 150;

	scene.add(star);

	return star;
};

// HANDLING SCENERY

const handleEarth = () => {
	if(earth) {
		earth.rotation.x += 0.0005;
	}
};

const handleAsteroid = () => {
	if(asteroid && earth) {
		if(removeOutOfBoundsAsteroid(asteroid)) {
			asteroid = createAsteroid();
		} else {
			asteroid.position.z += 3;
			asteroid.rotation.x += 0.01;
			asteroid.rotation.y += 0.005;
		}
	}
};

const handleStars = () => {
	stars.forEach(star => {
		star.position.z += 0.06;
		star.position.y += 0.1;
		if(removeOutOfBoundsStar(star)){
			stars.push(getStar());
		}
	});
};

// DETECTION

const removeOutOfBoundsStar = (star) => {
	if(star.position.z > 400 || star.position.y > 200) {
		scene.remove(star);
		removeFromArray(stars, stars.findIndex(s => s.uuid == star.uuid));
		return true;
	}
	return false;
};

const removeOutOfBoundsAsteroid = (asteroid) => {
	if(asteroid.position.z > 500) {
		scene.remove(asteroid);
		return true;
	}
	return false;
}

const detectAsteroidCollision = () => {
	if(asteroid) {
		if(camera.position.z < asteroid.position.z + asteroidRadius/2 
			 && camera.position.x > asteroid.position.x - asteroidRadius/2 
			 && camera.position.x < asteroid.position.x + asteroidRadius/2 ) {
			shakeCameraValues();
		}
	}
};

// CAMERA

const moveCamera = () => {
	camera.position.x += (cameraX - camera.position.x) * 0.05;
	camera.position.y += (cameraY - camera.position.y) * 0.05;
};

const shakeCameraValues = () => {
	if(!cameraIsShaking) cameraIsShaking = true;

	if(shakedFrames < 120) {
		shakedFrames++;
		if(shakedFrames % 10 == 0) {
			cameraX = Math.random() * (120 - shakedFrames) - ((120 - shakedFrames)/2);
			cameraY = Math.random() * ((120 - shakedFrames) - ((120 - shakedFrames)/2)) / 2;
		}
	} else {
		shakedFrames = 0;
		cameraY = 0;
		cameraIsShaking = false;
	}
}

ipc.on('move', function(val){
	if(val > 411 && val < 611 ) {
		cameraX = mapRange(val, 411, 611, 100, -100);
	}
});

// SYSTEM

const draw = () => {
	requestAnimationFrame(draw);

	effect.render(scene, camera);

	if(cameraIsShaking) shakeCameraValues();
	moveCamera();

	handleEarth();
	handleAsteroid();
	handleStars();

	detectAsteroidCollision();

};

const setup = () => {
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
	camera.position.x = 0;

	for(let i = 0; i < 300; i++) {
		stars.push(getStar());
	}
	createAsteroid();
	createEarth();

	draw();
};

setup();