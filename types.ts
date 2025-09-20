export type AspectRatio = '9:16' | '1:1' | '16:9' | '3:4' | '4:3';

export const aspectRatios: AspectRatio[] = ['9:16', '1:1', '16:9', '3:4', '4:3'];

export interface ImageObject {
    base64: string;
    mimeType: string;
}

export interface GeneratePosterParams {
    productImages: ImageObject[];
    concept: string;
    aspectRatio: AspectRatio;
    referenceImage?: ImageObject;
}

export interface EditPosterParams {
    currentPoster: ImageObject;
    instruction: string;
}

export interface SavedPoster {
    poster: ImageObject;
    aspectRatio: AspectRatio;
}