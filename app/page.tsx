'use client';

import { AppCard } from '@/components/AppCard';
import { Search, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppMetadata } from '@/types/electron';
import Link from 'next/link';

export default function Home() {
  const [apps, setApps] = useState<AppMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      try {
        // Check if running in Electron
        if (window.electron) {
          const data = await window.electron.storage.listApps();
          setApps(data);
        } else {
          // Fallback for web dev
          console.log('Not running in Electron, using mock data');
        }
      } catch (error) {
        console.error('Failed to load apps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Apps</h1>
          <p className="text-gray-400">Manage and install your personal applications</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search apps..."
              className="bg-gray-900 border border-gray-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 transition-all"
            />
          </div>
          <button className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {apps.map((app) => (
          <AppCard
            key={app.id}
            name={app.name}
            version={app.version}
            size={(app.size / (1024 * 1024)).toFixed(2) + ' MB'}
            description={app.description || 'No description'}
            icon={app.icon}
          />
        ))}

        {/* Add New Placeholder */}
        <Link href="/upload">
          <div className="h-full border-2 border-dashed border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-gray-700 hover:text-gray-400 hover:bg-gray-900/50 transition-all cursor-pointer group min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl">+</span>
            </div>
            <span className="font-medium">Upload New App</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
