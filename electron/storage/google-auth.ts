import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import url from 'url';
import { shell } from 'electron';
import getPort from 'get-port';

export class GoogleDriveAuth {
    private oauth2Client: OAuth2Client;
    private server: http.Server | null = null;

    constructor(clientId: string, clientSecret: string) {
        this.oauth2Client = new OAuth2Client(
            clientId,
            clientSecret,
            'http://localhost:3000/callback' // Placeholder, updated dynamically
        );
    }

    async authenticate(): Promise<any> {
        const port = await getPort();
        const redirectUri = `http://localhost:${port}/callback`;

        this.oauth2Client = new OAuth2Client(
            this.oauth2Client._clientId,
            this.oauth2Client._clientSecret,
            redirectUri
        );

        return new Promise((resolve, reject) => {
            this.server = http.createServer(async (req, res) => {
                try {
                    if (req.url?.startsWith('/callback')) {
                        const qs = new url.URL(req.url, `http://localhost:${port}`).searchParams;
                        const code = qs.get('code');

                        if (code) {
                            const { tokens } = await this.oauth2Client.getToken(code);
                            this.oauth2Client.setCredentials(tokens);

                            res.end('Authentication successful! You can close this window.');
                            resolve(tokens);
                        } else {
                            res.end('Authentication failed.');
                            reject(new Error('No code received'));
                        }

                        this.server?.close();
                    }
                } catch (e) {
                    reject(e);
                }
            });

            this.server.listen(port, () => {
                const authUrl = this.oauth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: ['https://www.googleapis.com/auth/drive.file'],
                });

                shell.openExternal(authUrl);
            });
        });
    }

    getClient(): OAuth2Client {
        return this.oauth2Client;
    }
}
