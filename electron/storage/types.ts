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

export interface StorageProvider {
    name: string;

    /**
     * Initialize the provider (e.g., auth, create folders)
     */
    init(): Promise<void>;

    /**
     * List all available apps
     */
    listApps(): Promise<AppMetadata[]>;

    /**
     * Upload a new app file
     */
    uploadApp(filePath: string, metadata: Omit<AppMetadata, 'id' | 'uploadedAt' | 'filename'>): Promise<AppMetadata>;

    /**
     * Get a download URL or path for an app
     */
    getDownloadUrl(id: string): Promise<string>;

    /**
     * Delete an app
     */
    deleteApp(id: string): Promise<void>;
}
