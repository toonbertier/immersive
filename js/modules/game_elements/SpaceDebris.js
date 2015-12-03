'use strict';

let helpers = require('../helpers/helpers');
let loadedModels = [];
let modelData =
[
 {
    "name": "solarStation",
    "file": "./assets/models/solarStation/solarStationModel.json",
    "scale": 0.5
 },
 // {
 //    "name": "comDish",
 //    "file": "./assets/models/comDish/comDishModel.json",
 //    "scale": 0.2
 // }
];

SpaceDebris.loadAll = function() {

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

SpaceDebris.loadJSONModel = function(data) {

  return new Promise((resolve, reject) => {

    let JSONLoader = new THREE.JSONLoader();

    JSONLoader.load(data.file, (geometry, materials) => {

      let material = new THREE.MeshFaceMaterial(materials);
      let object = new THREE.Mesh(geometry, material);

      object.position.x = 0;
      object.position.y = 0;
      object.position.z = -100;

      object.rotation.x = 0.4;

      object.scale.set(data.scale, data.scale, data.scale);

      return resolve(object);
    });

  });
};

function SpaceDebris(x, y, z) {

  let deg = Math.random() * 20 + 80;
  let rad = helpers.toRadians(deg);

  this.x = x;
  this.y = y;
  this.z = z;
  this.rotationSpeed = 0.0005;

  this.el = this.selectRandomModel();

}

SpaceDebris.prototype.selectRandomModel = function() {
  return loadedModels[Math.floor(Math.random()*loadedModels.length)];
}

SpaceDebris.prototype.update = function() {

    this.el.position.z += 3;
    this.el.rotation.x += 0.001;
    this.el.rotation.y += 0.005;

    if(this.checkOutOfBounds) {
      this.el.remove();
    }

};

SpaceDebris.prototype.checkOutOfBounds = function() {
  if(this.el.position.z > 500) {
    return true;
  }
  return false;
};

module.exports = SpaceDebris;
