'use client';

import { Cloud, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
    const [provider, setProvider] = useState('Google Drive');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [storagePath, setStoragePath] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Load initial path
    useState(() => {
        if (typeof window !== 'undefined' && window.electron) {
            window.electron.config.getStoragePath().then((path) => {
                if (path) setStoragePath(path);
            });
        }
    });

    const handleChangeLocation = async () => {
        if (!window.electron) return;

        const newPath = await window.electron.config.selectDirectory();
        if (newPath) {
            const shouldMove = confirm('Do you want to move existing apps to the new location?');
            setStatus('loading');

            const result = await window.electron.config.setStoragePath(newPath, shouldMove);

            if (result.success) {
                setStoragePath(newPath);
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(result.error || 'Failed to update storage path');
            }
        }
    };

    const handleSave = async () => {
        if (provider === 'Google Drive') {
            if (!clientId || !clientSecret) {
                setStatus('error');
                setErrorMessage('Client ID and Secret are required');
                return;
            }

            setStatus('loading');
            try {
                if (window.electron) {
                    const result = await window.electron.auth.google(clientId, clientSecret);
                    if (result.success) {
                        setStatus('success');
                    } else {
                        setStatus('error');
                        setErrorMessage(result.error || 'Authentication failed');
                    }
                } else {
                    console.log('Mock Auth: Success');
                    setStatus('success');
                }
            } catch (error) {
                setStatus('error');
                setErrorMessage('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Configure your storage providers and preferences</p>
            </div>

            <div className="space-y-6">
                {/* Storage Provider Section */}
                <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Cloud className="text-blue-500" size={24} />
                        <h2 className="text-xl font-semibold text-white">Storage Provider</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            {['Google Drive', 'OneDrive', 'Baidu Cloud'].map((p) => (
                                <label key={p} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="provider"
                                        className="peer hidden"
                                        checked={provider === p}
                                        onChange={() => setProvider(p)}
                                    />
                                    <div className="border border-gray-700 rounded-xl p-4 text-center hover:border-gray-500 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:text-blue-400 transition-all">
                                        <span className="font-medium">{p}</span>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {provider === 'Google Drive' && (
                            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Client ID</label>
                                    <input
                                        type="text"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Enter Google Cloud Client ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Client Secret</label>
                                    <input
                                        type="password"
                                        value={clientSecret}
                                        onChange={(e) => setClientSecret(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Enter Google Cloud Client Secret"
                                    />
                                </div>
                                <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4 text-sm text-blue-200">
                                    <p>To get these credentials:</p>
                                    <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-300/80">
                                        <li>Go to Google Cloud Console</li>
                                        <li>Create a project and enable Google Drive API</li>
                                        <li>Create OAuth 2.0 credentials (Desktop App)</li>
                                        <li>Add <code>http://localhost:PORT/callback</code> to redirect URIs</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Local Storage Settings */}
                <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                            <span className="font-bold">/</span>
                        </div>
                        <h2 className="text-xl font-semibold text-white">Local Storage</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Storage Location</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={storagePath}
                                    readOnly
                                    className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-gray-400 focus:outline-none cursor-not-allowed"
                                />
                                <button
                                    onClick={handleChangeLocation}
                                    className="bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                                >
                                    Change
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Current location where your apps are stored locally.
                            </p>
                        </div>
                    </div>
                </section>

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {status === 'success' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-400">
                        <CheckCircle size={20} />
                        <span>Successfully connected to {provider}!</span>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={status === 'loading'}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {status === 'loading' ? 'Connecting...' : 'Connect & Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
