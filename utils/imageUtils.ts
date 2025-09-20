import type { AspectRatio, ImageObject } from '../types';

export const parseAspectRatio = (ratio: AspectRatio): number => {
    const [w, h] = ratio.split(':').map(Number);
    return w / h;
};

export const calculateDimensions = (
    aspectRatio: AspectRatio, 
    longestEdge: number
): { width: number; height: number } => {
    const ratio = parseAspectRatio(aspectRatio);
    if (ratio >= 1) { // Landscape or square
        return {
            width: longestEdge,
            height: Math.round(longestEdge / ratio),
        };
    } else { // Portrait
        return {
            width: Math.round(longestEdge * ratio),
            height: longestEdge,
        };
    }
};

export const resizeImage = (
    poster: ImageObject,
    width: number, 
    height: number
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(img, 0, 0, width, height);
            // Get the data URL, remove the prefix, and resolve
            resolve(canvas.toDataURL('image/png').split(',')[1]);
        };
        img.onerror = (error) => reject(error);
        img.src = `data:${poster.mimeType};base64,${poster.base64}`;
    });
};

export const createBlankImage = (aspectRatio: AspectRatio): string => {
    const baseDimension = 1024; // A good base size for the model
    const { width, height } = calculateDimensions(aspectRatio, baseDimension);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get canvas context for blank image");
        return '';
    }
    // Use a neutral gray. It's less likely to influence color palettes than pure white or black.
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    // Get the data URL, remove the prefix, and return
    return canvas.toDataURL('image/png').split(',')[1];
};