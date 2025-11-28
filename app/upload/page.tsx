import { UploadDropzone } from '@/components/UploadDropzone';

export default function UploadPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Upload App</h1>
                <p className="text-gray-400">Add a new application to your personal store</p>
            </div>

            <div className="mt-12">
                <UploadDropzone />
            </div>
        </div>
    );
}
