'use strict';

(function(){

let ipc = require('ipc');
let helpers = require('./js/modules/helpers/helpers');

let Player = require('./js/modules/sound/Player');
let ModelLoader = require('./js/modules/loaders/ModelLoader.js');

let Robot = require('./js/modules/game_elements/Robot');
let Asteroid = require('./js/modules/game_elements/Asteroid');
let Star = require('./js/modules/game_elements/Star');
let Earth = require('./js/modules/game_elements/Earth');
let SpaceDebris = require('./js/modules/game_elements/SpaceDebris');
let Explosion = require('./js/modules/game_elements/Explosion');

let Timeline = require('./js/modules/story/Timeline');
window.bean = require('./js/libs/bean/bean.min.js');

let loadedModels = [], stars = [], explosions = [];
let robot;
let earth, asteroids = [], spaceDebris = [], bigAsteroid, laser;
let scene, renderer, effect;
let audioCtx, player, soundFX, soundtrack, timeline;

let generateSpaceDebris = false, generateSmallAsteroids = false, gameOver = false;

// SYSTEM

const setup = () => {

	setupThreeJS();
	Promise.all([setupScenery(), load3DModels(), setupAudio()]).then(() => {
		renderer.render(scene, robot.camera);

    // ARDUINO REPLACEMENT

    document.addEventListener('keydown', function(e) {
      switch (e.keyCode) {
        case 37:
          robot.speed = 0.4;
          break;
        case 39:
          robot.speed = -0.4;
          break;

        case 87:
          shootLaser('left');
          break;

        case 67:
          shootLaser('right');
          break;
      }

      document.addEventListener('keyup', function() {
        robot.speed = 0;
      });

    });

		hideDiv('.start-div');
		handleStartButton();
	});

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
  window.bean.on(robot, 'removeLaser', laser => scene.remove(laser));

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
		for(let i = 0; i < 350; i++) {
			stars.push(getStar(0));
		}

    return Promise.all([createEarth(0, -256, 300)]).then(() => resolve(true));
	});
};

const load3DModels = () => {
  return new Promise((resolve, reject) => {
    ModelLoader.loadAll().then(models => {
      loadedModels = models;
      return resolve(true);
    });
  });
}

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

      case 'space_debris':
        generateSpaceDebris = true;
        createSpaceDebris();
        break;

      case 'alarm_asteroid':
        // showDiv('.alarm-div');
        break;

      case 'speed_up':
        // hideDiv('.alarm-div');
        generateSpaceDebris = false;
        earth.moveTo(0, -250, 360);
        break;

      case 'start_comets':
        generateSmallAsteroids = true;
        createSmallAsteroids();
        break;

      case 'big_comet':
        createBigAsteroid();
        break;

      case 'big_comet_explosion':
        explodeObject(bigAsteroid.el);
        bigAsteroid = null;
        break;

      case 'back_to_earth':
        earth.moveTo(0, -220, 300);
        break;

    }

  });

};

const draw = () => {

	effect.render(scene, robot.camera);
	timeline.handleTime(soundtrack.currentTime);

  handleScenery();
  handleCollisions();

	if(robot.isShaking) robot.shakeCamera();
	robot.moveCamera();

  if(robot.lasers.length > 0) {
    robot.moveLasers();
  }

  if(!gameOver) {
    requestAnimationFrame(draw);
  } else {
    showDiv('.game-over-div');
  }

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

const createSmallAsteroids = () => {

  function loop() {

    let asteroid = new Asteroid("small");
    window.bean.on(asteroid, 'passing', () => {
      player.play(soundFX[1], player.calculatePanning(asteroid.el.position.x, robot.camera.position.x))
    });

    asteroid.renderSmall(robot.deg).then(_asteroid => {
      scene.add(_asteroid.el);
      asteroids.push(_asteroid);
    });

    if(generateSmallAsteroids) {
      setTimeout(loop, Math.random() * 4000 + 2000);
    }
  }

  loop();

};

const createSpaceDebris = () => {

  function loop() {

    let deg = robot.deg + Math.random() * 8 - 4;
    let rad = helpers.toRadians(deg);

    let x = 250 * Math.cos(rad);
    let y = 250 * Math.sin(rad) - 250;

    let model = loadedModels[Math.floor(Math.random() * loadedModels.length)].clone();
    let debris = new SpaceDebris(x, y, -800, model);
    debris.id = soundtrack.currentTime;
    spaceDebris.push(debris);
    scene.add(debris.el);

    if(generateSpaceDebris) {
      setTimeout(loop, Math.random() * 4000 + 2000);
    }

  }

  loop();

};

const createBigAsteroid = () => {

  bigAsteroid = new Asteroid("big");
  scene.add(bigAsteroid.renderBig(loadedModels[0], robot.deg));

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
  handleStars();

  handleSpaceObjectArrays(spaceDebris);
  handleSpaceObjectArrays(asteroids);

  if(bigAsteroid && bigAsteroid.el) {
    bigAsteroid.update();
  }

  if(explosions.length > 0) {
    explosions.forEach((e, index) => {
      if(e.handleScale()) {
        e.updateSphere();
      } else {
        scene.remove(e.el);
        scene.remove(e.particles);
        helpers.removeFromArray(explosions, index);
      }

      e.updateParticles();
    });
  }
};

const handleSpaceObjectArrays = (arr) => {
  if(arr.length > 0) {
    arr.forEach((e, index) => {
      if(e.checkOutOfBounds()) {
        scene.remove(e);
        helpers.removeFromArray(arr, index);
      } else {
        e.update();
      }
    });
  }
};

const handleCollisions = () => {

  if(robot.lasers.length > 0) {
    if(asteroids.length > 0) {
      asteroids.forEach((a, index) => {
        if(robot.detectLaserColliction(a.el)) {
          helpers.removeFromArray(asteroids, index);
          explodeObject(a.el);
          a = null;
        }
      });
    }
  }

  if(spaceDebris.length > 0) {
    spaceDebris.forEach((s, index) => {
      if(s.detectCollision(robot.camera)) {
        // gameOver = true;
        console.log('GAME OVER');
      }
    });
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

const explodeObject = (obj) => {

  let expl = new Explosion();
  explosions.push(expl);
  scene.add(expl.renderSphere(obj.position.x, obj.position.y, obj.position.z));
  scene.add(expl.renderParticles(obj.position.x, obj.position.y, obj.position.z));

  scene.remove(obj);

}

const showDiv = (cls) => {
  let div = document.querySelector(cls);
  div.classList.remove('hide');
}

const hideDiv = (cls) => {
  let div = document.querySelector(cls);
  console.log(div);
  div.classList.add('hide');
};

const shootLaser = (cannon) => {
  player.play(soundFX[2]);
  scene.add(robot.createLaser(cannon));
}

/* ARDUINO */

// ipc.on('move', function(val) {
// 	robot.speed = helpers.mapRange(val, 0, 1023, 0.7, -0.7);
// });

// ipc.on('shootLeftLaser', function() {
//   shootLaser('left');
// });

// ipc.on('shootRightLaser', function() {
//   shootLaser('right');
// })

setup();

})();
