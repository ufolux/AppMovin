'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, Settings, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
    { name: 'My Apps', href: '/', icon: LayoutGrid },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col h-full border-r border-gray-800">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    AppMovin
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            )}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Online</span>
                </div>
            </div>
        </div>
    );
}
