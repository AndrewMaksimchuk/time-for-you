// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const fs = require('fs');
// const path = require('path');

let mainWindow = null;
const settings = {
  window: null,
};

function createWindow () {
  // Create the browser window.
   mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    fullscreen: true,
    transparent: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.setResizable(false);
  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
}

// Menu small
let tray = null;

// Time for show and hide layout
const layoutTime = {
  showLayout: 900000,
  hideLayout: 60000,
  minutesToMiliseconds: function converTime(minutes) {
    return minutes * 60 * 1000;
  },
  get timeToShowLayout() {
    return this.showLayout;
  },
  get timeToHideLayout() {
    return this.hideLayout;
  },
  set timeToHideLayout(minutes) {
    this.hideLayout = this.minutesToMiliseconds(minutes);
  },
  set timeToShowLayout(minutes) {
    this.showLayout = this.minutesToMiliseconds(minutes);
  },
};

try {
  const settingsFile = require('./settings.json');
  if (settingsFile) {
    layoutTime.timeToShowLayout = settingsFile.showLayout;
    layoutTime.timeToHideLayout = settingsFile.hideLayout;
  }
} catch(err) {
  console.error(err);
}

// let inBreak = false;

function hideLayout() {
  mainWindow.hide();
  setTimeout(showLayout, layoutTime.timeToShowLayout);
}

function showLayout() {
  mainWindow.show();
  setTimeout(hideLayout, layoutTime.timeToHideLayout);
}

function closeApp() {
  app.quit();
}

function relaunchApp() {
  app.relaunch();
  app.quit();
}

function closeSettingsWindow() {
  settings.window.hide();
  relaunchApp();
}

function takeBreak() {
  mainWindow.show();
  setTimeout(() => mainWindow.hide(), layoutTime.timeToHideLayout);
}

function openWindowSettings() {
  // Open new window with all settings
  const options = {
    width: 350,
    // height: 600,
    parent: mainWindow,
    icon: './images/icons/sand-clock.png',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  };
  const childSettingsWindow = new BrowserWindow(options);
  settings.window = childSettingsWindow;
  childSettingsWindow.loadFile('./windows/settings/settings.html');
  childSettingsWindow.show();
  childSettingsWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Некоторые интерфейсы API могут использоваться только после возникновения этого события.
app.whenReady().then(() => {
  // Create Tray icon and menu, details on: https://www.electronjs.org/docs/api/tray
  tray = new Tray('./images/icons/sand-clock.png');
  // Create Menu and other staff on: https://www.electronjs.org/docs/api/menu
  const contextMenu = Menu.buildFromTemplate([
    // This is call name MenuItem, details on: https://www.electronjs.org/docs/api/menu-item
    { label: 'Take a break', type: 'normal', click: takeBreak },
    { label: 'Settings', type: 'normal', click: openWindowSettings },
    { label: 'Relaunch', type: 'normal', click: relaunchApp },
    { label: 'Exit', type: 'normal',  click: closeApp},
  ]);
  tray.setToolTip('Time for you');
  tray.setContextMenu(contextMenu);

  createWindow();
  setTimeout(showLayout, layoutTime.timeToShowLayout);
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('settings', (event, argument) => {
  if (argument.type === "close") {
    closeSettingsWindow();
  }
});
