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
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function(){

  mainWindow = new BrowserWindow({width: 1440, height: 720});
  mainWindow.openDevTools();
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  board.on('ready', initBoard);

  mainWindow.on('closed', function(){
    mainWindow = null;
  });

});

const initBoard = () => {
  let potentiometer = new five.Sensor({
     pin: "A0",
     freq: 250
  });

  board.repl.inject({
    pot: potentiometer
  });

  potentiometer.on("data", function(){
    console.log(this.raw);
    let value = this.raw;
    mainWindow.webContents.send('move', value);
  });
}

