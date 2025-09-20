import React, { useState, useEffect } from 'react';
import { Loader } from './common/Loader';
import { DownloadIcon } from './icons/DownloadIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ResetIcon } from './icons/ResetIcon';
import type { AspectRatio, ImageObject } from '../types';
import { DownloadModal } from './DownloadModal';

interface CanvasProps {
    poster: ImageObject | null;
    isLoading: boolean;
    loadingMessage: string;
    onSave: (poster: ImageObject, ratio: AspectRatio) => void;
    aspectRatio: AspectRatio;
}

export const Canvas: React.FC<CanvasProps> = ({ poster, isLoading, loadingMessage, onSave, aspectRatio }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    
    // Reset view when a new poster is generated
    useEffect(() => {
        resetTransform();
    }, [poster]);

    const handleDragStart = (e: React.DragEvent<HTMLImageElement>) => {
        if (poster) {
            e.dataTransfer.setData('text/plain', poster.base64);
        }
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (!poster || isLoading) return;
        e.preventDefault();

        const scaleAmount = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.5, scale + scaleAmount), 4);
        
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Adjust position to zoom towards the mouse pointer
        const newX = mouseX - (mouseX - position.x) * (newScale / scale);
        const newY = mouseY - (mouseY - position.y) * (newScale / scale);

        setScale(newScale);
        setPosition({ x: newX, y: newY });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!poster) return;
        e.preventDefault();
        setIsPanning(true);
        setStartPanPosition({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanning || !poster) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - startPanPosition.x,
            y: e.clientY - startPanPosition.y,
        });
    };

    const handleMouseUpOrLeave = () => {
        setIsPanning(false);
    };
    
    const resetTransform = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <>
            {showDownloadModal && poster && (
                <DownloadModal 
                    poster={poster}
                    aspectRatio={aspectRatio}
                    onClose={() => setShowDownloadModal(false)}
                />
            )}
            <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/50 h-full flex flex-col items-center justify-center shadow-lg shadow-purple-500/10 min-h-[500px] lg:min-h-0">
                <h2 className="text-2xl font-bold text-purple-400 mb-4 self-start">Canvas</h2>
                <div 
                    className="relative w-full h-full flex-grow flex items-center justify-center bg-black/20 rounded-lg overflow-hidden cursor-grab"
                    onWheel={handleWheel}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                >
                    {isLoading && <Loader message={loadingMessage} />}
                    {!isLoading && !poster && (
                        <div className="text-center text-gray-500">
                            <p className="text-lg">Your generated poster will appear here.</p>
                            <p>Fill out the controls and click "Generate".</p>
                        </div>
                    )}
                    {poster && !isLoading && (
                        <>
                            <img
                                src={`data:${poster.mimeType};base64,${poster.base64}`}
                                alt="Generated Poster"
                                className="max-w-full max-h-full object-contain rounded-lg"
                                draggable
                                onDragStart={handleDragStart}
                                onMouseDown={handleMouseDown}
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                    cursor: isPanning ? 'grabbing' : 'grab',
                                    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                                }}
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button onClick={resetTransform} className="p-2 rounded-full bg-black/50 hover:bg-cyan-500 transition-colors text-white group" title="Reset View">
                                    <ResetIcon className="w-6 h-6" />
                                </button>
                                <button onClick={() => onSave(poster, aspectRatio)} className="p-2 rounded-full bg-black/50 hover:bg-cyan-500 transition-colors text-white group" title="Save to Gallery">
                                    <PlusIcon className="w-6 h-6" />
                                </button>
                                <button onClick={() => setShowDownloadModal(true)} className="p-2 rounded-full bg-black/50 hover:bg-cyan-500 transition-colors text-white group" title="Download Poster">
                                    <DownloadIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};