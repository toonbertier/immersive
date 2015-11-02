'use strict'

// Electron
let ipc = require('ipc');
let app = require('app');  
let BrowserWindow = require('browser-window');  

// Johnny-Five
let five = require('johnny-five');
let board = five.Board();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 1440, height: 720});

  mainWindow.openDevTools();

  board.on('ready', function() {
    let potentiometer = new five.Sensor({
       pin: "A0",
       freq: 250
    });

    board.repl.inject({
      pot: potentiometer
    });

    potentiometer.on("data", function() {
      let value = this.raw;
      mainWindow.webContents.send('move', value);
    });
  });

  // load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

