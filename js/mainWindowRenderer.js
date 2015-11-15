'use strict';

(function(){

let ipc = require('ipc');
let helpers = require('./js/modules/helpers/helpers');
let Camera = require('./js/modules/studio/Camera');
let Player = require('./js/modules/sound/Player');
let Asteroid = require('./js/modules/game_elements/Asteroid');
let Star = require('./js/modules/game_elements/Star');
let Earth = require('./js/modules/game_elements/Earth');
let Timeline = require('./js/modules/story/Timeline');
window.bean = require('./js/libs/bean/bean.min.js');

let stars = [];
let earth, asteroid;
let camera, scene, renderer, effect;
let audioCtx, player, soundFX, soundtrack, timeline;

// SYSTEM

const setup = () => {

	setupThreeJS();
	Promise.all([setupScenery(), setupAudio()]).then(() => {
		renderer.render(scene, camera.el);
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

  camera = new Camera();
	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(1440, 720);
	document.body.appendChild(renderer.domElement);

	effect = new THREE.AnaglyphEffect(renderer);
	effect.setSize(1440, 720);

	let light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 1, 1).normalize();
	scene.add(light);

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

  	player = new Player();
    player.loadSoundData().then(data => {
      soundFX = data
      return resolve(true);
    });

		soundtrack = document.querySelector('.soundtrack');
		timeline = new Timeline();

	});

};

const draw = () => {

	effect.render(scene, camera.el);
	timeline.handleTime(soundtrack.currentTime);

	if(camera.isShaking) camera.shake();
	camera.move();

  handleScenery();
	if(asteroid.el && asteroid.detectCollision(camera.el.position)) camera.shake();
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
    window.bean.on(asteroid, 'passing', () => player.play(soundFX[1], player.calculatePanning(asteroid.el.position.x, camera.el.position.x)));

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
	return star;

};

// HANDLING SCENERY

const handleScenery = () => {
  if(earth) earth.update();
  handleAsteroid();
  handleStars();
};

const handleAsteroid = () => {

	if(asteroid.el && earth.el) {
		if(asteroid.checkOutOfBounds()) {
      scene.remove(asteroid.el);
			createAsteroid();
		} else {
			asteroid.update();
		}
	}

};

const handleStars = () => {

	stars.forEach(star => {
		star.update();

    if(star.checkOutOfBounds()){
      scene.remove(star.el);
      helpers.removeFromArray(stars, stars.findIndex(s => s.el.uuid == star.el.uuid));
      stars.push(getStar());
    }

	});

};

ipc.on('move', function(val) {
	if(val > 411 && val < 611 ) {
		camera.x = helpers.mapRange(val, 411, 611, -100, 100);
	}
});

setup();

})();
