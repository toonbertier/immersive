'use strict';

let ipc = require('ipc');
let helpers = require('./js/modules/helpers/helpers');
let BufferLoader = require('./js/modules/sound/BufferLoader');
let Player = require('./js/modules/sound/Player');
let Asteroid = require('./js/modules/game_elements/Asteroid');
let Star = require('./js/modules/game_elements/Star');
let Earth = require('./js/modules/game_elements/Earth');
let Timeline = require('./js/modules/story/Timeline');
let soundData = require('./assets/sounds/sounds.js');

let stars = [];
let earth, asteroid;
let camera, scene, renderer, effect;
let cameraX = 0, cameraY = 0, cameraIsShaking = false, shakedFrames;
let audioCtx, player, soundFX, soundtrack, timeline;

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
		// soundtrack.muted = true;

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

		timeline = new Timeline();

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

	timeline.handleTime(soundtrack.currentTime);

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

		earth = new Earth();

	  earth.render().then(_earth => {
	  	scene.add(_earth.el);
	  	return resolve(_earth.el);
	  });

	});
	
};

const createAsteroid = () => {

	return new Promise((resolve, reject) => {

		asteroid = new Asteroid();

	  asteroid.render().then(_asteroid => {
	  	scene.add(_asteroid.el);
	  	return resolve(_asteroid);
	  });

	});

};

const getStar = () => {

	let star = new Star();
	star.render();

	scene.add(star.el);
	return star.el;

};

// HANDLING SCENERY

const handleEarth = () => {
	if(earth) {
		earth.el.rotation.x += 0.0005;
	}
};

const handleAsteroid = () => {
	if(asteroid && earth) {
		if(removeOutOfBoundsAsteroid(asteroid)) {
			createAsteroid();
		} else {
			asteroid.el.position.z += 3;
			asteroid.el.rotation.x += 0.01;
			asteroid.el.rotation.y += 0.005;
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
	if(asteroid.el.position.z > 500) {
		scene.remove(asteroid.el);
		return true;
	}
	if(asteroid.el.position.z >= 214 && asteroid.el.position.z <= 216) {
		player.play(soundFX[1]);
	}
	return false;
}

const detectAsteroidCollision = () => {
	if(asteroid.el) {
		if(camera.position.z < asteroid.el.position.z + asteroid.el.geometry.boundingSphere.radius/2) {
			if(camera.position.x > asteroid.el.position.x - asteroid.el.geometry.boundingSphere.radius/2 
				 && camera.position.x < asteroid.el.position.x + asteroid.el.geometry.boundingSphere.radius/2 ) {
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