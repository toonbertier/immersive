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
let earth, asteroid, asteroidRadius, hud;
let camera, scene, renderer, effect;
let cameraX = 0, cameraY = 0, cameraIsShaking = false, shakedFrames;
let audioCtx, player;

// SYSTEM

const setup = () => {
	
	setupThreeJS();
	setupScenery();

	draw();

};

const setupThreeJS = () => {
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
};

const setupScenery = () => {
	for(let i = 0; i < 300; i++) {
		stars.push(getStar());
	}
	createAsteroid();
	createEarth();
	createHUD();
};

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

// CREATING SCENERY

const createEarth = () => {
	let earthGeometry = new THREE.SphereGeometry(190, 64, 64);

	let textureLoader = new THREE.TextureLoader();

	textureLoader.load('./assets/images/earth_map.png', texture => {
		textureLoader.load('./assets/images/earth_bump.jpg', bump => {
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

	textureLoader.load('./assets/images/asteroid_bump.jpg', bump => {
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

const createHUD = () => {
	let hudGeometry = new THREE.BoxGeometry(20, 9, 0.01);

	let textureLoader = new THREE.TextureLoader();

	textureLoader.load('./assets/images/hud.png', texture => {
		let hudMaterial = new THREE.MeshBasicMaterial();
		hudMaterial.transparant = true;
		hudMaterial.opacity = 0.8;
		hudMaterial.map = texture;
		hud = new THREE.Mesh(hudGeometry, hudMaterial);

		hud.position.z = 360;
		hud.position.x = camera.position.x;
		hud.position.y = camera.position.y;

		scene.add(hud);

	});
}

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
		} else {
			//player.play('long_whoosh', 0);
		}
	}
};

// CAMERA

const moveCamera = () => {
	camera.position.x += (cameraX - camera.position.x) * 0.05;
	camera.position.y += (cameraY - camera.position.y) * 0.05;
	if(hud) {
		moveHUD();
	}
};

const moveHUD = () => {
	hud.position.x = camera.position.x;
	hud.position.y = camera.position.y;
}

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

setup();