'use strict';

(function(){

let ipc = require('ipc');
let helpers = require('./js/modules/helpers/helpers');
let Robot = require('./js/modules/studio/Robot');
let Player = require('./js/modules/sound/Player');
let Asteroid = require('./js/modules/game_elements/Asteroid');
let Star = require('./js/modules/game_elements/Star');
let Earth = require('./js/modules/game_elements/Earth');
let Timeline = require('./js/modules/story/Timeline');
window.bean = require('./js/libs/bean/bean.min.js');

let stars = [];
let robot;
let earth, asteroid, laser;
let camera, scene, renderer, effect;
let audioCtx, player, soundFX, soundtrack, timeline;

// SYSTEM

const setup = () => {

	setupThreeJS();
	Promise.all([setupScenery(), setupAudio()]).then(() => {
		renderer.render(scene, robot.camera);
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

    // debug mute
		soundtrack.muted = true;

		draw();
	});

  button.click();

};

const setupThreeJS = () => {

  robot = new Robot();
  robot.createCamera();

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
			stars.push(getStar(0));
		}

    return Promise.all([createEarth(0, -256, 300)]).then(() => resolve(true));
	});
};

const setupAudio = () => {
	return new Promise((resolve, reject) => {

    soundtrack = document.querySelector('.soundtrack');
    timeline = new Timeline();
    addTimelineListeners();

  	player = new Player();
    player.loadSoundData().then(data => {
      soundFX = data
      return resolve(true);
    });

	});

};

const addTimelineListeners = () => {

  window.bean.on(timeline, 'timeline_event', e => {

    switch(e) {

      case 'arrived_in_space':
        earth.moveTo(0, -220, 300);
        stars.forEach(s => s.transitioning = true);
        break;

      case 'start_comets':
        createAsteroid();
        break;

    }

  });

};

const draw = () => {

	effect.render(scene, robot.camera);
	timeline.handleTime(soundtrack.currentTime);

  handleScenery();

	if(robot.isShaking) robot.shakeCamera();
	robot.moveCamera();

	if(asteroid && asteroid.el && asteroid.detectCollision(robot.camera.position)) robot.shakeCamera();

  if(robot.lasers != null) {
    robot.moveLasers();
    window.bean.on(robot, 'removeLaser', laser => scene.remove(laser));
  }

	requestAnimationFrame(draw);

};

// CREATING SCENERY

const createEarth = (x, y, z) => {

	return new Promise((resolve, reject) => {
		earth = new Earth(x, y, z);

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

const getStar = (autoOpacityChange) => {

	let star = new Star();
	star.render();
	scene.add(star.el);
  if(autoOpacityChange) star.transitioning = true;
	return star;

};

// HANDLING SCENERY

const handleScenery = () => {
  if(earth) earth.update();
  handleAsteroid();
  handleStars();
};

const handleAsteroid = () => {

	if(asteroid && asteroid.el && earth.el) {
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
      stars.push(getStar(1));
    }

	});

};

ipc.on('move', function(val) {
	robot.speed = helpers.mapRange(val, 0, 1023, 0.7, -0.7);
});

ipc.on('shootLaser', function() {
  console.log('shoot lazooor');
  scene.add(robot.createLaser());
});

setup();

})();
