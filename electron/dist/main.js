"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const local_1 = require("./storage/local");
const google_drive_1 = require("./storage/google-drive");
let mainWindow;
let storage = new local_1.LocalStorageProvider();
let googleDrive = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'hiddenInset',
    });
    const startUrl = process.env.ELECTRON_START_URL || `file://${path_1.default.join(__dirname, '../out/index.html')}`;
    mainWindow.loadURL(startUrl);
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
electron_1.app.on('ready', async () => {
    await storage.init();
    createWindow();
});
electron_1.app.on('window-all-closed', function () {
    electron_1.app.quit();
});
electron_1.app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
// IPC Handlers
electron_1.ipcMain.handle('get-app-version', () => {
    return electron_1.app.getVersion();
});
electron_1.ipcMain.handle('storage:list-apps', async () => {
    return await storage.listApps();
});
electron_1.ipcMain.handle('storage:upload-app', async (event, filePath, metadata) => {
    return await storage.uploadApp(filePath, metadata);
});
electron_1.ipcMain.handle('storage:get-download-url', async (event, id) => {
    return await storage.getDownloadUrl(id);
});
electron_1.ipcMain.handle('storage:delete-app', async (event, id) => {
    return await storage.deleteApp(id);
});
// Auth Handlers
electron_1.ipcMain.handle('auth:google', async (event, clientId, clientSecret) => {
    try {
        googleDrive = new google_drive_1.GoogleDriveProvider(clientId, clientSecret);
        await googleDrive.authenticate();
        storage = googleDrive; // Switch active storage to Google Drive
        return { success: true };
    }
    catch (error) {
        console.error('Google Auth Error:', error);
        return { success: false, error: error.message };
    }
});
// Local Storage Config Handlers
electron_1.ipcMain.handle('storage:get-path', async () => {
    if (storage instanceof local_1.LocalStorageProvider) {
        return await storage.getStoragePath();
    }
    return null;
});
electron_1.ipcMain.handle('storage:set-path', async (event, newPath, moveFiles) => {
    if (storage instanceof local_1.LocalStorageProvider) {
        await storage.setStoragePath(newPath, moveFiles);
        return { success: true };
    }
    return { success: false, error: 'Current provider is not local storage' };
});
electron_1.ipcMain.handle('dialog:open-directory', async () => {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory', 'createDirectory'],
    });
    if (result.canceled)
        return null;
    return result.filePaths[0];
});
