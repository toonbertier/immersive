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
      let object = new THREE.Mesh(geometry, material);

      object.position.x = this.x;
      object.position.y = this.y;
      object.position.z = this.z;

      object.rotation.x = 0.4;

      object.scale.set(data.scale, data.scale, data.scale);

      return resolve(object);
    });

  });
};

SpaceDebris.prototype.selectRandomModel = function() {
  return loadedModels[Math.floor(Math.random()*loadedModels.length)];
}

SpaceDebris.prototype.update = function(object) {

    object.position.z += 6;
    object.rotation.x += 0.001;
    object.rotation.y += 0.005;

    if(this.checkOutOfBounds) {
      object.remove();
    }

};

SpaceDebris.prototype.checkOutOfBounds = function(object) {
  if(object.position.z > 500) {
    console.log('out of bounds SpaceDebris');
    return true;
  }
  return false;
};

module.exports = SpaceDebris;
