'use strict';

let helpers = require('../helpers/helpers');

function Camera() {

  this.el = new THREE.PerspectiveCamera(50, 1440/720 , 1, 100000);
  this.el.position.z = 400;
  this.el.position.x = 0;

  this.isShaking = false;
  this.shakedFrames = 0;
  this.x = 0;
  this.y = 0;
  this.deg = 0;
  this.speed = 0;

  // this.sliderX = document.createElement("input");
  // this.sliderX.setAttribute('type', 'range');
  // this.sliderX.setAttribute('min', '0');
  // this.sliderX.setAttribute('max', '1000');
  // this.sliderX.setAttribute('class', 'sliderX');
  // document.body.appendChild(this.sliderX);

  // this.sliderY = document.createElement("input");
  // this.sliderY.setAttribute('type', 'range');
  // this.sliderY.setAttribute('min', '0');
  // this.sliderY.setAttribute('max', '1000');
  // this.sliderY.setAttribute('class', 'sliderY');
  // document.body.appendChild(this.sliderY);

  // this.sliderZ = document.createElement("input");
  // this.sliderZ.setAttribute('type', 'range');
  // this.sliderZ.setAttribute('min', '0');
  // this.sliderZ.setAttribute('max', '1000');
  // this.sliderZ.setAttribute('class', 'sliderZ');
  // document.body.appendChild(this.sliderZ);


}

Camera.prototype.shake = function() {

  if(!this.isShaking) this.isShaking = true;

  if(this.shakedFrames < 120) {
   this.shakedFrames++;
   if(this.shakedFrames % 10 == 0) {
     this.x = Math.random() * (120 - this.shakedFrames) - ((120 - this.shakedFrames)/2);
     this.y = Math.random() * ((120 - this.shakedFrames) - ((120 - this.shakedFrames)/2)) / 2;
   }
  } else {
   this.shakedFrames = 0;
   this.y = 0;
   this.isShaking = false;
  }

};

Camera.prototype.move = function() {

  this.deg += this.speed;

  let rad = helpers.toRadians(this.deg);

  this.x = 250 * Math.sin(rad);
  this.y = 250 * Math.cos(rad) - 250;

  this.el.rotation.z += (-rad - this.el.rotation.z) * 0.2;

  this.el.position.x += (this.x - this.el.position.x) * 0.2;
  this.el.position.y += (this.y - this.el.position.y) * 0.2;

  //this.t = this.x; //t is de positie op de cirkel, ik stel die gelijk aan x zodat je met potmeter erover kan gan voor testen

  // this.el.position.x = (Math.sin( this.t/this.sliderX.value) * 100);
  // this.el.position.y = (Math.cos( this.t/this.sliderY.value) * 100)-100; //-100 voor te late zakken
  // this.el.position.z = this.sliderZ.value;

  // console.log('x', this.sliderX.value);
  // console.log('y', this.sliderY.value);
  // console.log('z', this.sliderZ.value);

};

module.exports = Camera;
