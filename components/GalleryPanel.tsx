import React, { useState } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrashIcon } from './icons/TrashIcon';
import type { SavedPoster } from '../types';
import { DownloadModal } from './DownloadModal';

interface GalleryPanelProps {
    savedPosters: SavedPoster[];
    onClearGallery: () => void;
}

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ savedPosters, onClearGallery }) => {
    const [downloadingPoster, setDownloadingPoster] = useState<SavedPoster | null>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        // Drop functionality is more complex now that aspect ratio is needed.
        // For simplicity, we'll rely on the '+' button.
        // A more advanced implementation could use a custom dataTransfer type.
        console.log("Drag and drop to gallery is disabled; please use the '+' button on the canvas.");
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <>
            {downloadingPoster && (
                <DownloadModal 
                    poster={downloadingPoster.poster}
                    aspectRatio={downloadingPoster.aspectRatio}
                    onClose={() => setDownloadingPoster(null)}
                />
            )}
            <div 
                className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 h-full shadow-lg shadow-cyan-500/10 min-h-[300px] lg:min-h-0 flex flex-col"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="flex justify-between items-center border-b-2 border-cyan-400/20 pb-2 mb-4">
                    <h2 className="text-2xl font-bold text-cyan-400">Gallery</h2>
                    {savedPosters.length > 0 && (
                        <button 
                            onClick={onClearGallery} 
                            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                            title="Clear all posters from the gallery"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {savedPosters.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center text-gray-500 border-2 border-dashed border-gray-600 rounded-lg">
                            <p>Click the '+' on a poster to save it here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {savedPosters.map((savedItem, index) => (
                                <div key={index} className="relative group aspect-w-1 aspect-h-1">
                                    <img src={`data:${savedItem.poster.mimeType};base64,${savedItem.poster.base64}`} alt={`Saved Poster ${index + 1}`} className="rounded-lg object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => setDownloadingPoster(savedItem)} className="p-2 rounded-full bg-cyan-500/80 text-white hover:bg-cyan-500" title="Download">
                                            <DownloadIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};