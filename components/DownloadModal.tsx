import React, { useState, useMemo } from 'react';
import type { AspectRatio, ImageObject } from '../types';
import { calculateDimensions, resizeImage } from '../utils/imageUtils';

interface DownloadModalProps {
    poster: ImageObject;
    aspectRatio: AspectRatio;
    onClose: () => void;
}

const qualityLevels = {
    Normal: 2000,
    High: 4000,
    'Ultra High': 6000,
};

type Quality = keyof typeof qualityLevels;

export const DownloadModal: React.FC<DownloadModalProps> = ({ poster, aspectRatio, onClose }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dimensions = useMemo(() => {
        return (Object.keys(qualityLevels) as Quality[]).reduce((acc, key) => {
            acc[key] = calculateDimensions(aspectRatio, qualityLevels[key]);
            return acc;
        }, {} as Record<Quality, { width: number, height: number }>);
    }, [aspectRatio]);

    const handleDownload = async (quality: Quality) => {
        setIsDownloading(true);
        setError(null);
        try {
            const { width, height } = dimensions[quality];
            const resizedPoster = await resizeImage(poster, width, height);
            
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${resizedPoster}`;
            link.download = `poster-${quality.toLowerCase().replace(' ','-')}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            onClose();

        } catch (err) {
            console.error('Failed to resize and download image', err);
            setError('Could not process the download. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 border border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20 text-white w-full max-w-md m-4 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-cyan-400">Select Download Quality</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                
                {error && <p className="text-red-400 mb-4">{error}</p>}
                
                <div className="space-y-4">
                    {(Object.keys(qualityLevels) as Quality[]).map(quality => (
                        <button
                            key={quality}
                            onClick={() => handleDownload(quality)}
                            disabled={isDownloading}
                            className="w-full text-left p-4 bg-gray-700/50 hover:bg-cyan-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                            <p className="font-bold text-lg">{quality}</p>
                            <p className="text-sm text-gray-400">
                                {dimensions[quality].width} x {dimensions[quality].height} px
                            </p>
                        </button>
                    ))}
                </div>
                {isDownloading && (
                     <div className="mt-6 text-center text-cyan-300">
                         <p>Processing and preparing your download...</p>
                     </div>
                )}
            </div>
        </div>
    );
};