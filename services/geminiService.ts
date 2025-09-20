import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { GeneratePosterParams, EditPosterParams, ImageObject } from "../types";
import { createBlankImage } from "../utils/imageUtils";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const extractImageFromResponse = (response: GenerateContentResponse): ImageObject => {
    // Check if candidates exist and have content parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
        throw new Error("Invalid response structure from Gemini API.");
    }

    const imagePart = parts.find(part => part.inlineData);
    if (!imagePart || !imagePart.inlineData) {
        // Look for a text part that might contain an error from the model
        const textPart = parts.find(part => part.text);
        if (textPart && textPart.text) {
             throw new Error(`Gemini API did not return an image. Response: ${textPart.text}`);
        }
        throw new Error("No image found in the Gemini response.");
    }
    return {
        base64: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
    };
};

export const suggestConcept = async (imagesData: ImageObject[]): Promise<string> => {
    const imageParts = imagesData.map(img => ({
        inlineData: {
            data: img.base64,
            mimeType: img.mimeType,
        },
    }));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                ...imageParts,
                {
                    text: `Analyze the following product image(s). Based on the product's appearance, style, and potential use, generate a creative and detailed concept for a promotional poster. The concept should be a single paragraph, approximately 200-300 characters long. Only return the text of the concept, with no preamble or markdown.`,
                },
            ],
        },
    });

    return response.text.trim();
};

export const generatePoster = async (params: GeneratePosterParams): Promise<ImageObject> => {
    const { productImages, concept, aspectRatio, referenceImage } = params;

    const blankCanvasBase64 = createBlankImage(aspectRatio);
    const blankCanvasImage: ImageObject = {
        base64: blankCanvasBase64,
        mimeType: 'image/png'
    };
    
    const parts: any[] = [];
    
    // The order of parts is critical. Provide all visual context first.
    
    // 1. Add the blank canvas which defines the output dimensions.
    parts.push({ inlineData: { data: blankCanvasImage.base64, mimeType: blankCanvasImage.mimeType } });

    // 2. Add the product images.
    productImages.forEach(img => {
        parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } });
    });

    // 3. Add the style reference image, if provided. It will be the last image.
    if (referenceImage) {
        parts.push({ inlineData: { data: referenceImage.base64, mimeType: referenceImage.mimeType } });
    }

    // 4. Add the text prompt at the very end.
    // This prompt now accurately describes the order of the images provided before it.
    const promptText = `
**Task**: Create a promotional poster.

**Canvas & Aspect Ratio**: The very first image provided was a blank canvas with the target aspect ratio of ${aspectRatio}. You must use this as the foundation, and your final output must match these dimensions.

**Creative Concept**: "${concept}"

**Instructions**:
1.  Completely replace the blank canvas with a new scene inspired by the Creative Concept.
2.  The image(s) that followed the canvas are the primary product(s). Expertly cut them out from their original backgrounds.
3.  Integrate the product(s) into the new scene. They should be the main focus, appearing natural and well-composed.
${referenceImage ? `4. The very last image provided was a style reference. Use its color palette, lighting, and overall mood as strong inspiration for the scene you create.` : ''}

**Final Output**: Return ONLY the final composed image. No text, logos, or watermarks.
`;
    
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        }
    });

    return extractImageFromResponse(response);
};

export const editPoster = async (params: EditPosterParams): Promise<ImageObject> => {
    const { currentPoster, instruction } = params;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: currentPoster.base64,
                        mimeType: currentPoster.mimeType,
                    }
                },
                {
                    text: `Apply the following edit to the image: "${instruction}". Output only the edited image.`
                }
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        }
    });

    return extractImageFromResponse(response);
};