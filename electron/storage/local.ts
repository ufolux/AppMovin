import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { StorageProvider, AppMetadata } from './types';
import crypto from 'crypto';

export class LocalStorageProvider implements StorageProvider {
    name = 'Local Storage';
    private storageDir: string;
    private dbPath: string;

    constructor() {
        // Default to user's app data directory
        this.storageDir = path.join(app.getPath('userData'), 'apps');
        this.dbPath = path.join(app.getPath('userData'), 'db.json');
    }

    async init(): Promise<void> {
        try {
            // Load config if exists to get custom path
            const configPath = path.join(app.getPath('userData'), 'config.json');
            try {
                const configData = await fs.readFile(configPath, 'utf-8');
                const config = JSON.parse(configData);
                if (config.storagePath) {
                    this.storageDir = config.storagePath;
                }
            } catch {
                // Ignore if config doesn't exist
            }

            await fs.mkdir(this.storageDir, { recursive: true });
        } catch (error) {
            console.error('Failed to init local storage:', error);
        }
    }

    async getStoragePath(): Promise<string> {
        return this.storageDir;
    }

    async setStoragePath(newPath: string, moveFiles: boolean): Promise<void> {
        if (newPath === this.storageDir) return;

        await fs.mkdir(newPath, { recursive: true });

        if (moveFiles) {
            const files = await fs.readdir(this.storageDir);
            for (const file of files) {
                const src = path.join(this.storageDir, file);
                const dest = path.join(newPath, file);
                // Only move files, ignore directories if any (though we only store files)
                const stat = await fs.stat(src);
                if (stat.isFile()) {
                    await fs.copyFile(src, dest);
                    await fs.unlink(src);
                }
            }
        }

        this.storageDir = newPath;

        // Save config
        const configPath = path.join(app.getPath('userData'), 'config.json');
        await fs.writeFile(configPath, JSON.stringify({ storagePath: newPath }, null, 2));
    }

    private async getDb(): Promise<AppMetadata[]> {
        try {
            // DB is always in userData for now to keep it safe,
            // but we could move it too if requested.
            // For this requirement, we only move "apps" (files).
            const data = await fs.readFile(this.dbPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    private async saveDb(apps: AppMetadata[]): Promise<void> {
        await fs.writeFile(this.dbPath, JSON.stringify(apps, null, 2));
    }

    async listApps(): Promise<AppMetadata[]> {
        return this.getDb();
    }

    async uploadApp(filePath: string, metadata: Omit<AppMetadata, 'id' | 'uploadedAt' | 'filename'>): Promise<AppMetadata> {
        const id = crypto.randomUUID();
        const filename = path.basename(filePath);
        const targetPath = path.join(this.storageDir, `${id}-${filename}`);

        // Copy file to storage
        await fs.copyFile(filePath, targetPath);

        const newApp: AppMetadata = {
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

    async getDownloadUrl(id: string): Promise<string> {
        const apps = await this.getDb();
        const appData = apps.find(a => a.id === id);
        if (!appData) throw new Error('App not found');

        return path.join(this.storageDir, appData.filename);
    }

    async deleteApp(id: string): Promise<void> {
        const apps = await this.getDb();
        const appIndex = apps.findIndex(a => a.id === id);
        if (appIndex === -1) return;

        const appData = apps[appIndex];
        const targetPath = path.join(this.storageDir, appData.filename);

        try {
            await fs.unlink(targetPath);
        } catch {
            // Ignore if file missing
        }

        apps.splice(appIndex, 1);
        await this.saveDb(apps);
    }
}
