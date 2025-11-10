const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, 'public/icon.png'),
        title: 'Kings Field - Modern Dungeon Crawler'
    });

    // Load the game
    mainWindow.loadFile('index.html');

    // Open dev tools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Fullscreen toggle with F11
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F11') {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
            event.preventDefault();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});