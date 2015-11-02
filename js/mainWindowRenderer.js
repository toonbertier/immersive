'use strict';

let ipc = require('ipc');

// ThreeJS

let cameraPos;
let effect;

let camera = new THREE.PerspectiveCamera(60, 720/480 , 1, 100000);
let scene = new THREE.Scene();

let renderer = new THREE.WebGLRenderer();
renderer.setSize( 720, 480 );
document.body.appendChild(renderer.domElement);

let geometry = new THREE.BoxGeometry(1, 1, 1);
let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
let cube1 = new THREE.Mesh(geometry, material);

cube1.rotation.x = 10;
cube1.rotation.y = 30;
cube1.position.z = 0.05;
cube1.position.x = -3;
scene.add(cube1);

let cube2 = new THREE.Mesh(geometry, material);

cube2.rotation.x = 20;
cube2.rotation.y = 50;
cube2.position.z = 1.6;
cube2.position.x = 1;
scene.add(cube2);

effect = new THREE.AnaglyphEffect(renderer);
effect.setSize( 720, 480 );

camera.position.z = 5;

ipc.on('move', function(arg){
	cameraPos = arg/100;
})

const render = () => {
	requestAnimationFrame(render);
	camera.position.x = cameraPos;
	effect.render(scene, camera);
}

render();
