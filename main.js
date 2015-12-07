'use strict';

// Electron
let ipc = require('ipc');
let app = require('app');
let BrowserWindow = require('browser-window');

// Johnny-Five
let five = require('johnny-five');
let board = five.Board();

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

const initBoard = () => {

  /* I2C Config */

  /* SENSOR Config */

  let potentiometer = new five.Sensor({
     pin: "A0",
     freq: 250
  });
  let rightLaserButton = new five.Button(8);
  let leftLaserButton = new five.Button(9);

  board.repl.inject({
    pot: potentiometer,
    rightLaserButton: rightLaserButton,
    leftLaserButton: leftLaserButton
  });

  potentiometer.on("data", function(){
    let value = this.raw;
    mainWindow.webContents.send('move', value);
  });

  rightLaserButton.on("down", function(){
    mainWindow.webContents.send('shootRightLaser');
  });

  leftLaserButton.on("down", function(){
    mainWindow.webContents.send('shootLeftLaser');
  });
}

