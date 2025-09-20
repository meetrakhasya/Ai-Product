
import React from 'react';

interface LoaderProps {
    message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
    return (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 rounded-lg">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
            <p className="mt-4 text-lg text-white font-semibold">{message}</p>
        </div>
    );
};
