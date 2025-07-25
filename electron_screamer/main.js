const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.setIgnoreMouseEvents(false);
  win.loadFile('index.html');
  setTimeout(() => { win.close(); }, 5000);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
}); 