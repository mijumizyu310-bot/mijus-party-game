const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const { autoUpdater } = require('electron-updater');

app.setAppUserModelId('com.miju.partygame');
const gamePatchUrl = 'https://github.com/mijumizyu310-bot/mijus-party-game/releases/latest/download/game-patch.html';
let mainWindow;
const sendUpdate = (payload) => {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send('updater:status', payload);
  }
};
const sendPatch = (payload) => {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send('patch:status', payload);
  }
};
const packagedGamePath = () => path.join(__dirname, 'game', 'index.html');
const patchedGamePath = () => path.join(app.getPath('userData'), 'game-patch.html');
async function activeGamePath() {
  try {
    await fs.access(patchedGamePath());
    return patchedGamePath();
  } catch {
    return packagedGamePath();
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: '#a4e9e5',
    title: "Miju's Party Game!",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.loadFile(await activeGamePath());
}

ipcMain.handle('patch:apply', async () => {
  sendPatch({ state: 'checking' });
  try {
    const response = await fetch(gamePatchUrl, { cache: 'no-store' });
    if (response.status === 404) {
      sendPatch({ state: 'missing' });
      return { state: 'missing' };
    }
    if (!response.ok) throw new Error(`GitHubから更新を取得できませんでした (${response.status})`);
    const html = await response.text();
    if (html.length < 100_000 || html.length > 15_000_000 || !html.includes('embedded-cat-model') || !html.includes('</html>')) {
      throw new Error('更新ファイルを確認できませんでした');
    }
    const next = Buffer.from(html, 'utf8');
    let previous;
    try { previous = await fs.readFile(await activeGamePath()); } catch { previous = Buffer.alloc(0); }
    const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
    if (hash(next) === hash(previous)) {
      sendPatch({ state: 'current' });
      return { state: 'current' };
    }
    await fs.mkdir(app.getPath('userData'), { recursive: true });
    const tempPath = `${patchedGamePath()}.tmp`;
    await fs.writeFile(tempPath, next);
    await fs.rm(patchedGamePath(), { force: true });
    await fs.rename(tempPath, patchedGamePath());
    sendPatch({ state: 'applied' });
    setTimeout(async () => {
      if (mainWindow && !mainWindow.isDestroyed()) await mainWindow.loadFile(patchedGamePath());
    }, 650);
    return { state: 'applied' };
  } catch (error) {
    sendPatch({ state: 'error', message: error.message });
    return { state: 'error' };
  }
});

ipcMain.handle('updater:check', async () => {
  if (!app.isPackaged) {
    sendUpdate({ state: 'error', message: 'アプリ更新はインストール済みアプリで利用できます。' });
    return;
  }
  sendUpdate({ state: 'checking' });
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    sendUpdate({ state: 'error', message: error.message });
  }
});
ipcMain.on('updater:install', () => {
  if (app.isPackaged) autoUpdater.quitAndInstall(true, true);
});
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.on('update-available', (info) => {
  sendUpdate({ state: 'available', version: info.version });
  autoUpdater.downloadUpdate().catch((error) => sendUpdate({ state: 'error', message: error.message }));
});
autoUpdater.on('update-not-available', () => sendUpdate({ state: 'current' }));
autoUpdater.on('download-progress', (progress) => sendUpdate({ state: 'progress', percent: progress.percent }));
autoUpdater.on('update-downloaded', (info) => sendUpdate({ state: 'downloaded', version: info.version }));
autoUpdater.on('error', (error) => sendUpdate({ state: 'error', message: error.message }));

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
