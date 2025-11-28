"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    getAppVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
    storage: {
        listApps: () => electron_1.ipcRenderer.invoke('storage:list-apps'),
        uploadApp: (filePath, metadata) => electron_1.ipcRenderer.invoke('storage:upload-app', filePath, metadata),
        getDownloadUrl: (id) => electron_1.ipcRenderer.invoke('storage:get-download-url', id),
        deleteApp: (id) => electron_1.ipcRenderer.invoke('storage:delete-app', id),
    },
    auth: {
        google: (clientId, clientSecret) => electron_1.ipcRenderer.invoke('auth:google', clientId, clientSecret),
    },
    config: {
        getStoragePath: () => electron_1.ipcRenderer.invoke('storage:get-path'),
        setStoragePath: (newPath, moveFiles) => electron_1.ipcRenderer.invoke('storage:set-path', newPath, moveFiles),
        selectDirectory: () => electron_1.ipcRenderer.invoke('dialog:open-directory'),
    },
});
