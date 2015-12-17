'use strict';

let loadedModels = [];
let modelData =
[
  {
    "name": "bigComet",
    "file": "./assets/models/bigComet/bigCometModel.json",
    "scale": 1.9
 },
 {
    "name": "solarStation",
    "file": "./assets/models/solarStation/solarStationModel.json",
    "scale": 0.15
 },
];

function ModelLoader() {};

ModelLoader.loadAll = function() {

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

ModelLoader.loadJSONModel = function(data) {

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

module.exports = ModelLoader;
