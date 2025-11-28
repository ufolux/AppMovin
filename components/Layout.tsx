import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans selection:bg-blue-500/30">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative">
                {/* Title Bar Drag Area */}
                <div className="h-10 w-full fixed top-0 left-0 z-50 drag-region" style={{ WebkitAppRegion: 'drag' } as any} />

                <div className="p-8 pt-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
