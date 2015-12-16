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
let fps = 10;
let flashSide = 'none', leftLedsTimer, rightLedsTimer;
let lasersEnabled = false;

let mainWindow = null;

app.on('window-all-closed', function(){
  console.log('closing');
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function(){

  mainWindow = new BrowserWindow({width: 1440, height: 900});
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  mainWindow.setFullScreen(true);
  mainWindow.on('closed', function(){
    mainWindow = null;
  });

  board.on('ready', initBoard);

});

app.on('quit', function() {
  blankLeds();
  relayFan5v.close();
  relayFan12v.close();
  relayLeftLight.close();
  relayRightLight.close();
});

const initBoard = () => {

  /* LED Config */

  strip = new pixel.Strip({
    // board: boards.byId('leds'),
    board: board,
    controller: "FIRMATA",
    strips: [ {pin: 2, length: 60}, {pin: 3, length: 60},]
  });

  strip.on("ready", function() {
    stripReady = true;
    strip.color('#000');
    strip.show();

  });

  /* RELAY Config */

  relayFan5v = new five.Relay(6);
  relayFan12v = new five.Relay(7);
  relayLeftLight = new five.Relay(5);
  relayRightLight = new five.Relay(4);

  ipc.on('toggle-12v-fan', function(event, arg) {
    console.log('toggle 12v fan');
    if(!relayFan5v.isOn) relayFan5v.close();
    setTimeout(function (){
      console.log('toggle fan');
      if(relayFan5v.isOn) relayFan12v.open();
    }, 500);
  });

  ipc.on('toggle-5v-fan', function(event, arg) {
    if(!relayFan12v.isOn) relayFan12v.close();
    setTimeout(function (){
      if(relayFan12v.isOn) relayFan5v.open();
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

  ipc.on('alarm', (event, arg) => {
    neopixels_strobe(10000, 'red', 500);
  });

  ipc.on('laserControl', (event, laserStatus) => {
    if(laserStatus) neopixels_prepare_lasers();
    lasersEnabled = laserStatus;
  });

  ipc.on('strobe', (event, type) => {

    switch (type) {
      case 'launch':
        neopixels_strobe(8500, 'white', 50);
      break;

      case 'alarm':
        neopixels_strobe(10000, 'red', 500);
        break;

      case 'double':
        neopixels_strobe(400, 'white', 130);
        break;

      case 'short':
        neopixels_strobe(400, 'white', 50);
        break;

      case 'red':
        neopixels_strobe(5000, 'red', 50);
        break;
    }

  });

  ipc.on('roll', (event, duration) => {
    neopixels_roll(duration);
  });

  /* SENSOR Config */

  let potentiometer = new five.Sensor({
     pin: "A0",
     freq: 250
  });
  let rightLaserButton = new five.Button(8);
  let leftLaserButton = new five.Button(9);
  let startButton = new five.Button(10);


  board.repl.inject({
    pot: potentiometer,
    rightLaserButton: rightLaserButton,
    leftLaserButton: leftLaserButton,
    startButton: startButton,
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
    if(lasersEnabled) {
      mainWindow.webContents.send('shootRightLaser');
      flashSide = 'right';
      clearTimeout(rightLedsTimer);
      rightLedsTimer = setTimeout(() => {
        flashSide = 'none';
        clearTimeout(rightLedsTimer);
      }, 200);
    }
  });

  leftLaserButton.on("down", function(){
    if(lasersEnabled) {
      mainWindow.webContents.send('shootLeftLaser');
      flashSide = 'left';
      clearTimeout(leftLedsTimer)
      leftLedsTimer = setTimeout(() => {
        flashSide = 'none';
        clearTimeout(leftLedsTimer);
      }, 200);
    }
  });

  startButton.on('down', () => mainWindow.webContents.send('startStory'));
};

const neopixels_roll = time => {

  if (stripReady) {

    let count = 1;
    let animation = setInterval(() => {

      strip.color('#000');
      for (let i=count; i<strip.stripLength(); i+=3) {
        strip.pixel(i).color('orange');
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

const neopixels_flash = (time, color, side) => {

  if(stripReady) {

    if(side === 'left') {
      for(let i = 0; i < (strip.stripLength()/2); i++) {
        strip.pixel(i).color(color);
      }
    } else {
      for(let i = 60; i < strip.stripLength(); i++) {
        strip.pixel(i).color(color);
      }
    }

    strip.show();

    let timeOut = setTimeout(() => {
      strip.color('#000');
      strip.show();
      clearTimeout(timeOut);
    }, time);

  // stopAnimation();

  }

};

const stopAnimation = (animation, time) => {
  setTimeout(() => {
    clearInterval(animation);
    blankLeds();
    setTimeout(() => {
      blankLeds();
    }, 100);
  }, time);
};

const blankLeds = () => {
  strip.color('#000');
  strip.show();
};

const neopixels_prepare_lasers = () => {

  var show = setInterval(() => {

    if(flashSide === 'right') {
      for(let i = 59; i > 0; i-=1) {
        strip.pixel(i).color('green');
        strip.show();
      }
    } else if(flashSide === 'left') {
      for(let i = 119; i > 60; i-=1) {
        strip.pixel(i).color('green');
        strip.show();
      }
    } else {
      blankLeds();
    }

  }, 1000/fps);

};
