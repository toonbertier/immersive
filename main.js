'use strict';

// Electron
let ipc = require('ipc');
let app = require('app');
let BrowserWindow = require('browser-window');

// Johnny-Five
let five = require('johnny-five');
let pixel = require('node-pixel');
let board = five.Board();
let strip = null;
let stripReady = false;
let relayFan5v, relayFan12v, relayLeftLight, relayRightLight;

let mainWindow = null;

app.on('window-all-closed', function(){
  console.log('closing');
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function(){

  mainWindow = new BrowserWindow({width: 1440, height: 900});
  mainWindow.openDevTools();
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  board.on('ready', initBoard);

  mainWindow.on('closed', function(){
    mainWindow = null;
  });

});

app.on('quit', function() {
  ledsOff();
  relayFan5v.close();
  relayFan12v.close();
  relayLeftLight.close();
  relayRightLight.close();
});

const initBoard = () => {

  /* LED Config */

  strip = new pixel.Strip({
    board: board,
    controller: "FIRMATA",
    strips: [ {pin: 2, length: 60}, {pin: 9, length: 60},]
  });

  strip.on("ready", function() {
    stripReady = true;
    strip.color('#000');
    strip.show();
  });

  /* RELAY Config */

  relayFan5v = new five.Relay(10);
  relayFan12v = new five.Relay(6);
  relayLeftLight = new five.Relay(12);
  relayRightLight = new five.Relay(11);

  ipc.on('toggle-12v-fan', function(event, arg) {
    if(!relayFan5v.isOn) relayFan5v.close();
    setTimeout(function (){
      if(relayFan5v.isOn) relayFan12v.toggle();
    }, 500);
  });

  ipc.on('toggle-5v-fan', function(event, arg) {
    if(!relayFan12v.isOn) relayFan12v.close();
    setTimeout(function (){
      if(relayFan12v.isOn) relayFan5v.toggle();
    }, 500);
  });

  ipc.on('flash-left-light', function(event, arg) {
    relayLeftLight.open();
    setTimeout(function (){
      relayLeftLight.close();
    }, 500);
  });

  ipc.on('flash-right-light', function(event, arg) {
    relayRightLight.open();
    setTimeout(function (){
      relayRightLight.close();
    }, 500);
  });

  ipc.on('flash-both-lights', function(event, arg) {
    relayLeftLight.open();
    relayRightLight.open();
    setTimeout(function (){
      relayLeftLight.close();
      relayRightLight.close();
    }, 500);
  });

  /* SENSOR Config */

  let potentiometer = new five.Sensor({
     pin: "A0",
     freq: 250
  });
  let rightLaserButton = new five.Button(7);
  let leftLaserButton = new five.Button(8);

  board.repl.inject({
    pot: potentiometer,
    rightLaserButton: rightLaserButton,
    leftLaserButton: leftLaserButton,
    relayFan5v: relayFan5v,
    relayFan12v: relayFan12v,
    relayLeftLight: relayLeftLight,
    relayRightLight: relayRightLight
  });

  relayFan5v.close();
  relayFan12v.close();
  relayLeftLight.close();
  relayRightLight.close();

  potentiometer.on("data", function(){
    let value = this.raw;
    mainWindow.webContents.send('move', value);
  });

  rightLaserButton.on("down", function(){
    mainWindow.webContents.send('shootRightLaser');
    neopixels_flash(100, '#00ff00', 0);
  });

  leftLaserButton.on("down", function(){
    mainWindow.webContents.send('shootLeftLaser');
    neopixels_flash(100, '#00ff00', 60);
  });
};

const neopixels_roll = (strip, time) => {

  if (stripReady) {

    let count = 1;
    let animation = setInterval(() => {

      strip.color('#000000');
      for (let i=count; i<strip.stripLength(); i+=3) {
        strip.pixel(i).color('#ffffff');
      }

      strip.show();
      if(count === 3) count = 0;
      else count++;

    }, 200);

    stopAnimation(animation, time);

  };

};

const neopixels_strobe = (time, color, span) => {

  if(stripReady) {

    let shine = true;
    strip.color(color); //setinterval begint pas na span
    strip.show();

    let animation = setInterval(() => {

      if(shine) {
        strip.color('#000');
        shine = false;
      } else {
        strip.color(color);
        shine = true;
      }

      strip.show();

    }, span);

    stopAnimation(animation, time);

  }

};

const neopixels_flash = (time, color, offset) => {

  if(stripReady) {

    if(offset < 60) {
      for(let i = 0; i < strip.stripLength(); i++) {
        if(i < 60) {
          strip.pixel(i).color(color);
        }
      }
    }

    if(offset >= 60) {
      for(let i = 0; i < strip.stripLength(); i++) {
        if(i >= 60) {
          strip.pixel(i).color(color);
        }
      }
    }
    strip.show();

    let timeOut = setTimeout(() => {
      console.log('blank');
      strip.color('#000');
      strip.show();
      clearTimeout(timeOut);
    }, 500);

  // stopAnimation()

  }

};

const stopAnimation = (animation, time) => {
  setTimeout(() => {
    clearInterval(animation);
    ledsOff();
    setTimeout(() => {
      ledsOff();
    }, 100);
  }, time);
};

const ledsOff = () => {
  strip.color('#000');
  strip.show();
};

