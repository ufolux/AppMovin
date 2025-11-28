"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveAuth = void 0;
const google_auth_library_1 = require("google-auth-library");
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const electron_1 = require("electron");
const get_port_1 = __importDefault(require("get-port"));
class GoogleDriveAuth {
    constructor(clientId, clientSecret) {
        this.server = null;
        this.oauth2Client = new google_auth_library_1.OAuth2Client(clientId, clientSecret, 'http://localhost:3000/callback' // Placeholder, updated dynamically
        );
    }
    async authenticate() {
        const port = await (0, get_port_1.default)();
        const redirectUri = `http://localhost:${port}/callback`;
        this.oauth2Client = new google_auth_library_1.OAuth2Client(this.oauth2Client._clientId, this.oauth2Client._clientSecret, redirectUri);
        return new Promise((resolve, reject) => {
            this.server = http_1.default.createServer(async (req, res) => {
                try {
                    if (req.url?.startsWith('/callback')) {
                        const qs = new url_1.default.URL(req.url, `http://localhost:${port}`).searchParams;
                        const code = qs.get('code');
                        if (code) {
                            const { tokens } = await this.oauth2Client.getToken(code);
                            this.oauth2Client.setCredentials(tokens);
                            res.end('Authentication successful! You can close this window.');
                            resolve(tokens);
                        }
                        else {
                            res.end('Authentication failed.');
                            reject(new Error('No code received'));
                        }
                        this.server?.close();
                    }
                }
                catch (e) {
                    reject(e);
                }
            });
            this.server.listen(port, () => {
                const authUrl = this.oauth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: ['https://www.googleapis.com/auth/drive.file'],
                });
                electron_1.shell.openExternal(authUrl);
            });
        });
    }
    getClient() {
        return this.oauth2Client;
    }
}
exports.GoogleDriveAuth = GoogleDriveAuth;
