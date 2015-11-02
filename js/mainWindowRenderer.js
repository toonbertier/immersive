'use strict';

let ipc = require('ipc');

let spheres = [];

let effect;
let camera = new THREE.PerspectiveCamera(90, 720/480 , 1, 100000);
let scene = new THREE.Scene();

let renderer = new THREE.WebGLRenderer();
renderer.setSize( 720, 480 );
document.body.appendChild(renderer.domElement);

let geometry = new THREE.SphereGeometry(2, 32, 32);
let material = new THREE.MeshBasicMaterial({ color: 0xdddddd, wireframe: true });

effect = new THREE.AnaglyphEffect(renderer);
effect.setSize( 720, 480 );

camera.position.z = 200;

// ipc.on('move', function(arg){
// 	cameraX = arg/1000;
// 	cameraZ = 5 - arg/1000;
// });

const removeOutOfBounds = (sphere) => {
	if(sphere.position.z > 200) {
		scene.remove(sphere);
		spheres.remove(spheres.findIndex(s => s.uuid == sphere.uuid));
		return true;
	}
	return false;
}

const createNewSphere = () => {
	let sphere = new THREE.Mesh(geometry, material);
	sphere.position.z = Math.random() * 50;
	sphere.position.x = Math.random() * 300 - 150;
	sphere.position.y = Math.random() * 200 - 100;
	scene.add(sphere);

	return sphere;
}

const render = () => {
	requestAnimationFrame(render);
	effect.render(scene, camera);

	spheres.forEach(sphere => {
		sphere.position.z += 0.3;
		if(removeOutOfBounds(sphere)){
			spheres.push(createNewSphere());
		}
	});
}

const init = () => {

	for(let i = 0; i < 50; i++) {
		spheres.push(createNewSphere());
	}

	console.log(spheres);

	render();
}

init();
