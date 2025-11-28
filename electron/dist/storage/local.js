"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageProvider = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const crypto_1 = __importDefault(require("crypto"));
class LocalStorageProvider {
    constructor() {
        this.name = 'Local Storage';
        // Default to user's app data directory
        this.storageDir = path_1.default.join(electron_1.app.getPath('userData'), 'apps');
        this.dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'db.json');
    }
    async init() {
        try {
            // Load config if exists to get custom path
            const configPath = path_1.default.join(electron_1.app.getPath('userData'), 'config.json');
            try {
                const configData = await promises_1.default.readFile(configPath, 'utf-8');
                const config = JSON.parse(configData);
                if (config.storagePath) {
                    this.storageDir = config.storagePath;
                }
            }
            catch {
                // Ignore if config doesn't exist
            }
            await promises_1.default.mkdir(this.storageDir, { recursive: true });
        }
        catch (error) {
            console.error('Failed to init local storage:', error);
        }
    }
    async getStoragePath() {
        return this.storageDir;
    }
    async setStoragePath(newPath, moveFiles) {
        if (newPath === this.storageDir)
            return;
        await promises_1.default.mkdir(newPath, { recursive: true });
        if (moveFiles) {
            const files = await promises_1.default.readdir(this.storageDir);
            for (const file of files) {
                const src = path_1.default.join(this.storageDir, file);
                const dest = path_1.default.join(newPath, file);
                // Only move files, ignore directories if any (though we only store files)
                const stat = await promises_1.default.stat(src);
                if (stat.isFile()) {
                    await promises_1.default.copyFile(src, dest);
                    await promises_1.default.unlink(src);
                }
            }
        }
        this.storageDir = newPath;
        // Save config
        const configPath = path_1.default.join(electron_1.app.getPath('userData'), 'config.json');
        await promises_1.default.writeFile(configPath, JSON.stringify({ storagePath: newPath }, null, 2));
    }
    async getDb() {
        try {
            // DB is always in userData for now to keep it safe,
            // but we could move it too if requested.
            // For this requirement, we only move "apps" (files).
            const data = await promises_1.default.readFile(this.dbPath, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return [];
        }
    }
    async saveDb(apps) {
        await promises_1.default.writeFile(this.dbPath, JSON.stringify(apps, null, 2));
    }
    async listApps() {
        return this.getDb();
    }
    async uploadApp(filePath, metadata) {
        const id = crypto_1.default.randomUUID();
        const filename = path_1.default.basename(filePath);
        const targetPath = path_1.default.join(this.storageDir, `${id}-${filename}`);
        // Copy file to storage
        await promises_1.default.copyFile(filePath, targetPath);
        const newApp = {
            ...metadata,
            id,
            filename: `${id}-${filename}`,
            uploadedAt: Date.now(),
        };
        const apps = await this.getDb();
        apps.push(newApp);
        await this.saveDb(apps);
        return newApp;
    }
    async getDownloadUrl(id) {
        const apps = await this.getDb();
        const appData = apps.find(a => a.id === id);
        if (!appData)
            throw new Error('App not found');
        return path_1.default.join(this.storageDir, appData.filename);
    }
    async deleteApp(id) {
        const apps = await this.getDb();
        const appIndex = apps.findIndex(a => a.id === id);
        if (appIndex === -1)
            return;
        const appData = apps[appIndex];
        const targetPath = path_1.default.join(this.storageDir, appData.filename);
        try {
            await promises_1.default.unlink(targetPath);
        }
        catch {
            // Ignore if file missing
        }
        apps.splice(appIndex, 1);
        await this.saveDb(apps);
    }
}
exports.LocalStorageProvider = LocalStorageProvider;
