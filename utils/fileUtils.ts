import type { ImageObject } from "../types";

export const fileToBase64 = (file: File): Promise<ImageObject> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const parts = result.split(',');
            if (parts.length !== 2) {
                return reject(new Error('Invalid Data URL format'));
            }
            const mimeType = parts[0].match(/:(.*?);/)?.[1];
            if (!mimeType) {
                 return reject(new Error('Could not determine MIME type from Data URL'));
            }
            resolve({ base64: parts[1], mimeType });
        };
        reader.onerror = error => reject(error);
    });
};