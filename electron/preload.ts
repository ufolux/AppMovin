import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    storage: {
        listApps: () => ipcRenderer.invoke('storage:list-apps'),
        uploadApp: (filePath: string, metadata: any) => ipcRenderer.invoke('storage:upload-app', filePath, metadata),
        getDownloadUrl: (id: string) => ipcRenderer.invoke('storage:get-download-url', id),
        deleteApp: (id: string) => ipcRenderer.invoke('storage:delete-app', id),
    },
    auth: {
        google: (clientId: string, clientSecret: string) => ipcRenderer.invoke('auth:google', clientId, clientSecret),
    },
    config: {
        getStoragePath: () => ipcRenderer.invoke('storage:get-path'),
        setStoragePath: (newPath: string, moveFiles: boolean) => ipcRenderer.invoke('storage:set-path', newPath, moveFiles),
        selectDirectory: () => ipcRenderer.invoke('dialog:open-directory'),
    },
});
