'use strict';

let ipc = require('ipc');

let stars = [];
let earth;
let camera, scene, renderer, effect;

// ipc.on('move', function(val){
// 	camera.position.x = (val - 1017) / 10;
// });

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

const createEarth = () => {
	let earthGeometry = new THREE.SphereGeometry(190, 32, 32);

	let earthMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
	earthMaterial.map = THREE.ImageUtils.loadTexture('./assets/earth_map.jpg');
	earthMaterial.bumpMap = THREE.ImageUtils.loadTexture('./assets/earth_bump.jpg');
	earthMaterial.bumpScale = 0.5;
	earthMaterial.specularMap = THREE.ImageUtils.loadTexture('./assets/earth_spec.jpg');
	earthMaterial.specular = new THREE.Color('grey');

	earth = new THREE.Mesh(earthGeometry, earthMaterial);

	earth.position.z = 300;
	earth.position.x = 0;
	earth.position.y = -220;

	scene.add(earth);
};

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

	earth.rotation.x += 0.0005;

	stars.forEach(star => {
		star.position.z += 0.2;
		star.position.y += 0.2;
		if(removeOutOfBoundsStar(star)){
			stars.push(createStar());
		}
	});
};

const init = () => {
	camera = new THREE.PerspectiveCamera(50, 720/480 , 1, 100000);
	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( 720, 480 );
	document.body.appendChild(renderer.domElement);

	effect = new THREE.AnaglyphEffect(renderer);
	effect.setSize( 720, 480 );

	camera.position.z = 400;

	for(let i = 0; i < 150; i++) {
		stars.push(createStar());
	}
	createEarth();

	render();
};

init();