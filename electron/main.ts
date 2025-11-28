import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';

import { LocalStorageProvider } from './storage/local';
import { GoogleDriveProvider } from './storage/google-drive';
import { StorageProvider } from './storage/types';

let mainWindow: BrowserWindow | null;
let storage: StorageProvider = new LocalStorageProvider();
let googleDrive: GoogleDriveProvider | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'hiddenInset',
    });

    const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../out/index.html')}`;

    mainWindow.loadURL(startUrl);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', async () => {
    await storage.init();
    createWindow();
});

app.on('window-all-closed', function () {
    app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC Handlers
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('storage:list-apps', async () => {
    return await storage.listApps();
});

ipcMain.handle('storage:upload-app', async (event, filePath, metadata) => {
    return await storage.uploadApp(filePath, metadata);
});

ipcMain.handle('storage:get-download-url', async (event, id) => {
    return await storage.getDownloadUrl(id);
});

ipcMain.handle('storage:delete-app', async (event, id) => {
    return await storage.deleteApp(id);
});

// Auth Handlers
ipcMain.handle('auth:google', async (event, clientId, clientSecret) => {
    try {
        googleDrive = new GoogleDriveProvider(clientId, clientSecret);
        await googleDrive.authenticate();
        storage = googleDrive; // Switch active storage to Google Drive
        return { success: true };
    } catch (error: any) {
        console.error('Google Auth Error:', error);
        return { success: false, error: error.message };
    }
});

// Local Storage Config Handlers
ipcMain.handle('storage:get-path', async () => {
    if (storage instanceof LocalStorageProvider) {
        return await storage.getStoragePath();
    }
    return null;
});

ipcMain.handle('storage:set-path', async (event, newPath, moveFiles) => {
    if (storage instanceof LocalStorageProvider) {
        await storage.setStoragePath(newPath, moveFiles);
        return { success: true };
    }
    return { success: false, error: 'Current provider is not local storage' };
});

ipcMain.handle('dialog:open-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openDirectory', 'createDirectory'],
    });
    if (result.canceled) return null;
    return result.filePaths[0];
});
