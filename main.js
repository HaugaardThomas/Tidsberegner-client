const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
require('dotenv').config();


let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
 
        autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

 mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
}

app.on('ready', () => {
  createWindow();

  // Check for updates after the window is created.
  autoUpdater.checkForUpdatesAndNotify();
});


autoUpdater.on('update-available', () => {
  console.log('Update available. Downloading...');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded; will install now');
  autoUpdater.quitAndInstall();
});
