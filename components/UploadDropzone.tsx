'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import { clsx } from 'clsx';

export function UploadDropzone() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const uploadFile = async (fileToUpload: File) => {
        if (!window.electron) {
            console.log('Not in Electron, skipping upload');
            return;
        }

        try {
            // In Electron, File object has a 'path' property
            const filePath = (fileToUpload as any).path;

            await window.electron.storage.uploadApp(filePath, {
                name: fileToUpload.name.replace(/\.[^/.]+$/, ""), // Remove extension
                version: '1.0.0', // Default
                size: fileToUpload.size,
                description: 'Uploaded via AppMovin',
            });

            // Success handling (could redirect or show success)
            alert('Upload successful!');
            setFile(null);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed');
        }
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            await uploadFile(droppedFile);
        }
    }, [uploadFile]);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            await uploadFile(selectedFile);
        }
    }, [uploadFile]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {!file ? (
                <div
                    className={clsx(
                        'border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer',
                        isDragging
                            ? 'border-blue-500 bg-blue-500/10 scale-105'
                            : 'border-gray-700 hover:border-gray-500 hover:bg-gray-900/50'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".dmg,.app,.pkg,.ipa,.apk"
                    />
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                        <UploadCloud size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Drag & Drop your app here</h3>
                    <p className="text-gray-400 mb-6">Supports .dmg, .pkg, .ipa, .apk</p>
                    <button className="bg-white text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                        Browse Files
                    </button>
                </div>
            ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center">
                                <File size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">{file.name}</h4>
                                <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="text-gray-500 hover:text-white p-2"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Uploading...</span>
                            <span className="text-white">45%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[45%] rounded-full" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">
                            Cancel Upload
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
