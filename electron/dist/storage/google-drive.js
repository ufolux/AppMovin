"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveProvider = void 0;
const googleapis_1 = require("googleapis");
const google_auth_1 = require("./google-auth");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class GoogleDriveProvider {
    constructor(clientId, clientSecret) {
        this.name = 'Google Drive';
        this.folderId = null;
        this.auth = new google_auth_1.GoogleDriveAuth(clientId, clientSecret);
    }
    async init() {
        // In a real app, we would load saved tokens here
        // For now, we trigger auth if not authenticated
        // This logic should be improved to check for existing tokens first
    }
    async authenticate() {
        await this.auth.authenticate();
        this.drive = googleapis_1.google.drive({ version: 'v3', auth: this.auth.getClient() });
        await this.ensureFolder();
    }
    async ensureFolder() {
        // Check if 'AppMovin' folder exists
        const res = await this.drive.files.list({
            q: "mimeType='application/vnd.google-apps.folder' and name='AppMovin' and trashed=false",
            fields: 'files(id, name)',
        });
        if (res.data.files && res.data.files.length > 0) {
            this.folderId = res.data.files[0].id;
        }
        else {
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
    async listApps() {
        if (!this.drive || !this.folderId)
            return [];
        const res = await this.drive.files.list({
            q: `'${this.folderId}' in parents and trashed=false`,
            fields: 'files(id, name, size, description, webContentLink, createdTime, appProperties)',
        });
        return (res.data.files || []).map((file) => ({
            id: file.id,
            name: file.name, // We might store metadata in description or appProperties
            version: file.appProperties?.version || '1.0.0',
            size: parseInt(file.size || '0'),
            description: file.description,
            filename: file.name,
            uploadedAt: new Date(file.createdTime).getTime(),
        }));
    }
    async uploadApp(filePath, metadata) {
        if (!this.drive || !this.folderId)
            throw new Error('Not authenticated');
        const fileMetadata = {
            name: path_1.default.basename(filePath),
            parents: [this.folderId],
            description: metadata.description,
            appProperties: {
                version: metadata.version,
                appName: metadata.name,
            },
        };
        const media = {
            mimeType: 'application/octet-stream',
            body: fs_1.default.createReadStream(filePath),
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
    async getDownloadUrl(id) {
        if (!this.drive)
            throw new Error('Not authenticated');
        const file = await this.drive.files.get({
            fileId: id,
            fields: 'webContentLink',
        });
        return file.data.webContentLink;
    }
    async deleteApp(id) {
        if (!this.drive)
            throw new Error('Not authenticated');
        await this.drive.files.delete({ fileId: id });
    }
}
exports.GoogleDriveProvider = GoogleDriveProvider;
