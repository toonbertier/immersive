'use strict';

let helpers = require('../helpers/helpers');

function Explosion(size) {
  this.growing = true;
  this.scale = 0.1;
  this.size = size

  if(size == 'small') {
    this.parMovementSpeed = 30;
    this.parTotalObjects = 1000;
  } else {
    this.parMovementSpeed = 60;
    this.parTotalObjects = 2000;
  }
  this.parObjectSize = 2;
  this.parSizeRandomness = 1000;

  this.parDirections = [];
}

Explosion.prototype.renderSphere = function(x, y, z, radius) {

  let geometry = new THREE.SphereGeometry(radius, 32, 16 );
  let material = new THREE.MeshLambertMaterial( { color: 0xffffff, emissive: 0xeeeeee } );
  this.el = new THREE.Mesh( geometry, material );
  this.el.position.set(x, y, z);

  let spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.ImageUtils.loadTexture( './assets/images/glow.png' ),
    color: 0xffffff,
    transparent: false,
    blending: THREE.AdditiveBlending
  });
  this.sprite = new THREE.Sprite( spriteMaterial );
  this.sprite.scale.set(5 * radius, 5 * radius, 1.0);
  this.el.add(this.sprite);

  return this.el;

}

Explosion.prototype.handleScale = function() {

  if(this.scale >= 1) {
    this.growing = false;
  } else if(this.scale <= 0) {
    this.stopUpdating = true;
  }

  if(this.growing) {
    this.scale += 0.1;
    return true;
  } else if(!this.stopUpdating) {
    this.scale -= 0.08;
    return true;
  } else if(this.stopUpdating) {
    return false;
  }

}

Explosion.prototype.updateSphere = function() {
  this.el.scale.set(this.scale, this.scale, this.scale);
}

Explosion.prototype.renderParticles = function(x, y, z) {
  let geometry = new THREE.Geometry();

  for(let i = 0; i < this.parTotalObjects; i ++) {
    let vertex = new THREE.Vector3();
    vertex.x = x;
    vertex.y = y;
    vertex.z = z;

    geometry.vertices.push(vertex);
    this.parDirections.push({
      x:(Math.random() * this.parMovementSpeed)-(this.parMovementSpeed/2),
      y:(Math.random() * this.parMovementSpeed)-(this.parMovementSpeed/2),
      z:(Math.random() * this.parMovementSpeed)-(this.parMovementSpeed/2)
    });
  }

  let material = new THREE.PointsMaterial({size: this.parObjectSize, color: 0xffffff});
  this.particles = new THREE.Points(geometry, material);
  this.parStatus = true;

  this.xDir = (Math.random() * this.parMovementSpeed)-(this.parMovementSpeed/2);
  this.yDir = (Math.random() * this.parMovementSpeed)-(this.parMovementSpeed/2);
  this.zDir = (Math.random() * this.parMovementSpeed)-(this.parMovementSpeed/2);

  return this.particles;
}

Explosion.prototype.updateParticles = function() {
  if (this.parStatus == true){
    for(let i = 0; i < this.parTotalObjects; i++) {
      let particle = this.particles.geometry.vertices[i];
      particle.y += this.parDirections[i].y;
      particle.x += this.parDirections[i].x;
      particle.z += this.parDirections[i].z;
    }
    this.particles.geometry.verticesNeedUpdate = true;
  }
}

module.exports = Explosion;
