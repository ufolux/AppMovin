export interface AppMetadata {
    id: string;
    name: string;
    version: string;
    size: number;
    description?: string;
    icon?: string;
    filename: string;
    uploadedAt: number;
}

declare global {
    interface Window {
        electron: {
            getAppVersion: () => Promise<string>;
            storage: {
                listApps: () => Promise<AppMetadata[]>;
                uploadApp: (filePath: string, metadata: Omit<AppMetadata, 'id' | 'uploadedAt' | 'filename'>) => Promise<AppMetadata>;
                getDownloadUrl: (id: string) => Promise<string>;
                deleteApp: (id: string) => Promise<void>;
            };
            auth: {
                google: (clientId: string, clientSecret: string) => Promise<{ success: boolean; error?: string }>;
            };
            config: {
                getStoragePath: () => Promise<string | null>;
                setStoragePath: (newPath: string, moveFiles: boolean) => Promise<{ success: boolean; error?: string }>;
                selectDirectory: () => Promise<string | null>;
            };
        };
    }
}
