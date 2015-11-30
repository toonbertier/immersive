'use strict';

let helpers = require('../helpers/helpers');

function SpaceDebris() {

  let deg = Math.random() * 20 + 80;
  let rad = helpers.toRadians(deg);

  this.x = 0;
  this.y = 0;
  this.z = 300;
  this.rotationSpeed = 0.0005;

}

SpaceDebris.prototype.render = function() {

  return new Promise((resolve, reject) => {

    let mtlLoader = new THREE.MTLLoader();
    let objLoader = new THREE.OBJLoader();

    mtlLoader.load('./assets/models/solarStation/solarStation.mtl', _ma => {
      console.log(_ma);
    });

    // mtlLoader.load('./assets/models/comDish/comDish.mtl', _ma => {
    //   objLoader.load('./assets/models/comDish/comDish.obj', _mo => {

    //     console.log(_ma);

    //     _mo.position.x = this.x;
    //     _mo.position.y = this.y;
    //     _mo.position.z = this.z;

    //     _mo.scale.x = 2;
    //     _mo.scale.y = 2;
    //     _mo.scale.z = 2;

    //     _mo.rotation.x = 0.4;
    //     return resolve(_mo);

    //   });
    // });

  });

};

SpaceDebris.prototype.update = function() {

};

module.exports = SpaceDebris;
