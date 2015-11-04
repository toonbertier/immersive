'use strict';

let ipc = require('ipc');
let helpers = require('./js/modules/helpers/helpers');
let BufferLoader = require('./js/modules/sound/BufferLoader');
let Player = require('./js/modules/sound/Player');
let sounds = require('./assets/sounds/sounds.js');

let stars = [];
let earth, asteroid, asteroidRadius;
let camera, scene, renderer, effect;
let cameraX = 0, cameraY = 0, cameraIsShaking = false, shakedFrames;
let audioCtx, player, soundFX;

// --- temp debug variables
	
let asteroidSoundPlaying = false;

// ---

// SYSTEM

const setup = () => {
	
	setupThreeJS();
	setupScenery();
	setupAudio();

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
};

const setupAudio = () => {

  window.AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

	audioCtx = new AudioContext();
  player = new Player(audioCtx);

  loadSetting(sounds);
};

const loadSetting = sounds => {
  let loader = new BufferLoader(audioCtx);
  loader.load(sounds)
  	.then(data => {
  			console.log(data);
  			soundFX = data;
  	});
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
		helpers.removeFromArray(stars, stars.findIndex(s => s.uuid == star.uuid));
		return true;
	}
	return false;
};

const removeOutOfBoundsAsteroid = (asteroid) => {
	if(asteroid.position.z > 500) {
		scene.remove(asteroid);
		return true;
	}
	if(asteroid.position.z >= 214 && asteroid.position.z <= 216) {
		player.play(soundFX[1]);
	}
	return false;
}

const detectAsteroidCollision = () => {
	if(asteroid) {
		if(camera.position.z < asteroid.position.z + asteroidRadius/2) {
			if(camera.position.x > asteroid.position.x - asteroidRadius/2 
				 && camera.position.x < asteroid.position.x + asteroidRadius/2 ) {
				shakeCameraValues();
			}
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
		cameraX = helpers.mapRange(val, 411, 611, 100, -100);
	}
});

setup();