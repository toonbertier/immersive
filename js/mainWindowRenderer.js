'use strict';

let ipc = require('ipc');
let helpers = require('./js/modules/helpers/helpers');
let BufferLoader = require('./js/modules/sound/BufferLoader');
let Player = require('./js/modules/sound/Player');
let soundData = require('./assets/sounds/sounds.js');

let stars = [];
let earth, asteroid, asteroidRadius;
let camera, scene, renderer, effect;
let cameraX = 0, cameraY = 0, cameraIsShaking = false, shakedFrames;
let audioCtx, player, soundFX, soundtrack;

// SYSTEM

const setup = () => {

	setupThreeJS();
	Promise.all([setupScenery(), setupAudio()]).then(() => {
		renderer.render(scene, camera);
		removeLoading();
		handleStartButton();
	});
};

const removeLoading = () => {
	document.querySelector('.loading').parentNode.removeChild(document.querySelector('.loading'));
};

const handleStartButton = () => {
	let button = document.querySelector('.start');
	let buttonDiv = document.querySelector('.start-div');

	button.classList.remove('hide');
	button.addEventListener('click', (e) => {
		e.preventDefault();
		buttonDiv.parentNode.removeChild(buttonDiv);
		soundtrack.play();

		draw();
	});
};

const setupThreeJS = () => {
	camera = new THREE.PerspectiveCamera(50, 1440/720 , 1, 100000);
	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(1440, 720);
	document.body.appendChild(renderer.domElement);

	effect = new THREE.AnaglyphEffect(renderer);
	effect.setSize(1440, 720);

	let light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 1, 1).normalize();
	scene.add(light);

	camera.position.z = 400;
	camera.position.x = 0;
};

const setupScenery = () => {
	return new Promise((resolve, reject) => {
		for(let i = 0; i < 300; i++) {
			stars.push(getStar());
		}
		return Promise.all([createAsteroid(), createEarth()]).then(() => resolve(true));
	});
};

const setupAudio = () => {
	return new Promise((resolve, reject) => {
  	window.AudioContext =
    	window.AudioContext ||
    	window.webkitAudioContext;

		audioCtx = new AudioContext();
  	player = new Player(audioCtx);
		soundtrack = document.querySelector('.soundtrack');

  	loadSoundData(soundData).then(data => {
  		soundFX = data
  		return resolve(true);
  	});
	});
};

const loadSoundData = sounds => {
	return new Promise((resolve, reject) => {
		let loader = new BufferLoader(audioCtx);
	  loader.load(sounds).then(data => {
	  	return resolve(data);
	  });
	});
  
};

const draw = () => {
	effect.render(scene, camera);

	console.log(soundtrack.currentTime);

	if(cameraIsShaking) shakeCameraValues();
	moveCamera();

	handleEarth();
	handleAsteroid();
	handleStars();

	detectAsteroidCollision();

	requestAnimationFrame(draw);
};

// CREATING SCENERY

const createEarth = () => {
	return new Promise((resolve, reject) => {

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
				return resolve(earth);
			});
		});

	});
	
};

const createAsteroid = () => {
	return new Promise((resolve, reject) => {

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
			return resolve(asteroid);
		});
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
			createAsteroid();
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
		cameraX = helpers.mapRange(val, 411, 611, -100, 100);
	}
});

setup();