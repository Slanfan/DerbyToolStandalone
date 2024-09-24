const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const qr = require('qrcode');
const { spawn } = require('child_process');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  return '127.0.0.1';  // Fallback to localhost if no external IP is found
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'renderer', 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function startServer() {
  console.log('Starting web server')
  
  // Spawn a new process to run the server
  serverProcess = spawn(process.execPath, [path.join(__dirname, 'server.js')]);

  serverProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

function stopServer() {
  console.log('Stopping web server')
  if (!serverProcess) {
    console.log('...no server process found')
    return
  }
  serverProcess.kill('SIGTERM');
}

app.whenReady().then(() => {
  startServer()
  createWindow()
});

ipcMain.handle('getLocalIP', () => getLocalIP());

ipcMain.on('open-admin', (event, url) => {
  console.log(`Opening URL: ${url}`);
  shell.openExternal(url);
});

app.on('window-all-closed', () => {
  console.log('window-all-closed')
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('App is quitting, stopping server...');
  stopServer();
});
