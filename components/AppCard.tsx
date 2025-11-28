import { Download, MoreVertical, HardDrive } from 'lucide-react';
import { clsx } from 'clsx';

interface AppCardProps {
    name: string;
    version: string;
    size: string;
    icon?: string;
    description: string;
}

export function AppCard({ name, version, size, icon, description }: AppCardProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-900/20">
                    {icon || name[0]}
                </div>
                <button className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{description}</p>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <span className="bg-gray-800 px-2 py-1 rounded-md text-gray-400">{version}</span>
                    <span className="flex items-center gap-1"><HardDrive size={12} /> {size}</span>
                </div>

                <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-200">
                    <Download size={16} />
                    Install
                </button>
            </div>
        </div>
    );
}
