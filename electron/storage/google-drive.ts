import { google } from 'googleapis';
import { StorageProvider, AppMetadata } from './types';
import { GoogleDriveAuth } from './google-auth';
import fs from 'fs';
import path from 'path';

export class GoogleDriveProvider implements StorageProvider {
    name = 'Google Drive';
    private auth: GoogleDriveAuth;
    private drive: any;
    private folderId: string | null = null;

    constructor(clientId: string, clientSecret: string) {
        this.auth = new GoogleDriveAuth(clientId, clientSecret);
    }

    async init(): Promise<void> {
        // In a real app, we would load saved tokens here
        // For now, we trigger auth if not authenticated
        // This logic should be improved to check for existing tokens first
    }

    async authenticate(): Promise<void> {
        await this.auth.authenticate();
        this.drive = google.drive({ version: 'v3', auth: this.auth.getClient() });
        await this.ensureFolder();
    }

    private async ensureFolder() {
        // Check if 'AppMovin' folder exists
        const res = await this.drive.files.list({
            q: "mimeType='application/vnd.google-apps.folder' and name='AppMovin' and trashed=false",
            fields: 'files(id, name)',
        });

        if (res.data.files && res.data.files.length > 0) {
            this.folderId = res.data.files[0].id;
        } else {
            // Create folder
            const fileMetadata = {
                name: 'AppMovin',
                mimeType: 'application/vnd.google-apps.folder',
            };
            const file = await this.drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });
            this.folderId = file.data.id;
        }
    }

    async listApps(): Promise<AppMetadata[]> {
        if (!this.drive || !this.folderId) return [];

        const res = await this.drive.files.list({
            q: `'${this.folderId}' in parents and trashed=false`,
            fields: 'files(id, name, size, description, webContentLink, createdTime, appProperties)',
        });

        return (res.data.files || []).map((file: any) => ({
            id: file.id,
            name: file.name, // We might store metadata in description or appProperties
            version: file.appProperties?.version || '1.0.0',
            size: parseInt(file.size || '0'),
            description: file.description,
            filename: file.name,
            uploadedAt: new Date(file.createdTime).getTime(),
        }));
    }

    async uploadApp(filePath: string, metadata: Omit<AppMetadata, 'id' | 'uploadedAt' | 'filename'>): Promise<AppMetadata> {
        if (!this.drive || !this.folderId) throw new Error('Not authenticated');

        const fileMetadata = {
            name: path.basename(filePath),
            parents: [this.folderId],
            description: metadata.description,
            appProperties: {
                version: metadata.version,
                appName: metadata.name,
            },
        };

        const media = {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(filePath),
        };

        const file = await this.drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, size, webContentLink, createdTime',
        });

        return {
            id: file.data.id,
            name: metadata.name,
            version: metadata.version,
            size: parseInt(file.data.size),
            description: metadata.description,
            filename: file.data.name,
            uploadedAt: new Date(file.data.createdTime).getTime(),
        };
    }

    async getDownloadUrl(id: string): Promise<string> {
        if (!this.drive) throw new Error('Not authenticated');

        const file = await this.drive.files.get({
            fileId: id,
            fields: 'webContentLink',
        });

        return file.data.webContentLink;
    }

    async deleteApp(id: string): Promise<void> {
        if (!this.drive) throw new Error('Not authenticated');
        await this.drive.files.delete({ fileId: id });
    }
}
