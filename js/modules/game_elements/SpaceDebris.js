/*

TODO:

selectRandom
renderRandom
outOfBounds -> selectNewRandom

*/

'use strict';

let helpers = require('../helpers/helpers');
let loadedModels = [];
let modelData =
[
 {
    "name": "solarStation",
    "file": "./assets/models/solarStation/solarStationModel.json",
    "scale": 2
 },
 {
    "name": "comDish",
    "file": "./assets/models/comDish/comDishModel.json",
    "scale": 0.2
 }
]

function SpaceDebris() {

  let deg = Math.random() * 20 + 80;
  let rad = helpers.toRadians(deg);

  this.x = 0;
  this.y = 0;
  this.z = -100;
  this.rotationSpeed = 0.0005;

}

SpaceDebris.prototype.loadAll = function() {

  return new Promise((resolve, reject) => {

    let _arr = [];

    modelData.forEach(data => {
      _arr.push(this.loadJSONModel(data));
    });

    Promise.all(_arr).then(arr => {
      loadedModels = arr;
      return resolve(arr)
    });

  });
}

SpaceDebris.prototype.loadJSONModel = function(data) {

  return new Promise((resolve, reject) => {

    let JSONLoader = new THREE.JSONLoader();

    JSONLoader.load(data.file, (geometry, materials) => {

      let material = new THREE.MeshFaceMaterial(materials);
      this.el = new THREE.Mesh(geometry, material);

      this.el.position.x = this.x;
      this.el.position.y = this.y;
      this.el.position.z = this.z;

      this.el.rotation.x = 0.4;

      this.el.scale.set(data.scale, data.scale, data.scale);

      return resolve(this.el);
    });

  });
};

SpaceDebris.prototype.update = function() {
  this.el.position.z += 1;
  this.el.rotation.x += 0.001;
  this.el.rotation.y += 0.005;
};

module.exports = SpaceDebris;
