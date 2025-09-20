import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Canvas } from './components/Canvas';
import { GalleryPanel } from './components/GalleryPanel';
import type { AspectRatio, SavedPoster, ImageObject } from './types';
import { generatePoster, suggestConcept } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
    const [productImages, setProductImages] = useState<File[]>([]);
    const [referenceImage, setReferenceImage] = useState<File[]>([]);
    const [concept, setConcept] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [editPrompt, setEditPrompt] = useState<string>('');

    const [currentPoster, setCurrentPoster] = useState<ImageObject | null>(null);
    const [savedPosters, setSavedPosters] = useState<SavedPoster[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuggestingConcept, setIsSuggestingConcept] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (productImages.length === 0) {
            setConcept('');
            return;
        }

        const getSuggestion = async () => {
            setIsSuggestingConcept(true);
            setError(null);
            try {
                const imageData = await Promise.all(productImages.map(file => fileToBase64(file)));
                const suggestion = await suggestConcept(imageData);
                setConcept(suggestion);
            } catch (err) {
                console.error("Failed to get concept suggestion", err);
                // Non-critical error, so we don't block the user.
            } finally {
                setIsSuggestingConcept(false);
            }
        };

        const debounce = setTimeout(() => {
            getSuggestion();
        }, 500); // Debounce to avoid rapid firing if user changes files quickly

        return () => clearTimeout(debounce);
    }, [productImages]);


    const handleGenerate = useCallback(async () => {
        if (productImages.length === 0) {
            setError('Please upload at least one product image first.');
            return;
        }
        if (!concept) {
            setError('Please provide a concept for the poster.');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            setLoadingMessage('Preparing images...');
            const productData = await Promise.all(productImages.map(file => fileToBase64(file)));
            const refData = referenceImage.length > 0 ? await fileToBase64(referenceImage[0]) : undefined;

            setLoadingMessage('Generating poster...');
            const newPoster = await generatePoster({
                productImages: productData,
                concept,
                aspectRatio,
                referenceImage: refData
            });

            setCurrentPoster(newPoster);

        } catch (err) {
            console.error(err);
            setError(`Failed to generate poster: ${err instanceof Error ? err.message : 'An unknown error occurred.'}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }

    }, [productImages, referenceImage, concept, aspectRatio]);

    const handleEdit = useCallback(async () => {
        if (!currentPoster) {
            setError('Generate a poster before you can edit it.');
            return;
        }
        if (!editPrompt) {
            setError('Please provide an edit instruction.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setLoadingMessage('Applying edits...');

        try {
            const { editPoster } = await import('./services/geminiService');
            const editedPoster = await editPoster({
                currentPoster,
                instruction: editPrompt
            });
            setCurrentPoster(editedPoster);
            setEditPrompt('');
        } catch (err) {
            console.error(err);
            setError(`Failed to edit poster: ${err instanceof Error ? err.message : 'An unknown error occurred.'}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [currentPoster, editPrompt]);
    
    const handleSavePoster = useCallback((poster: ImageObject, ratio: AspectRatio) => {
        if (!savedPosters.some(p => p.poster.base64 === poster.base64)) {
            setSavedPosters(prev => [...prev, { poster, aspectRatio: ratio }]);
        }
    }, [savedPosters]);

    const handleClearGallery = useCallback(() => {
        setSavedPosters([]);
    }, []);

    const handleProductImagesChange = (files: File[]) => {
        setProductImages(files);
        setCurrentPoster(null); // Reset canvas
    };

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    AI Poster Fusion
                </h1>
                <p className="text-gray-400 mt-2">Create stunning product posters with the power of Gemini</p>
            </header>
            
            {error && (
                <div className="max-w-4xl mx-auto bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                        <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </span>
                </div>
            )}

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3">
                    <ControlPanel
                        productImages={productImages}
                        setProductImages={handleProductImagesChange}
                        referenceImage={referenceImage}
                        setReferenceImage={setReferenceImage}
                        concept={concept}
                        setConcept={setConcept}
                        aspectRatio={aspectRatio}
                        setAspectRatio={setAspectRatio}
                        editPrompt={editPrompt}
                        setEditPrompt={setEditPrompt}
                        onGenerate={handleGenerate}
                        onEdit={handleEdit}
                        isGenerating={isLoading && loadingMessage.includes('Generating')}
                        isEditing={isLoading && loadingMessage.includes('Applying')}
                        isSuggestingConcept={isSuggestingConcept}
                        isPosterGenerated={!!currentPoster}
                    />
                </div>
                <div className="lg:col-span-6">
                    <Canvas
                        poster={currentPoster}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        onSave={handleSavePoster}
                        aspectRatio={aspectRatio}
                    />
                </div>
                <div className="lg:col-span-3">
                    <GalleryPanel savedPosters={savedPosters} onClearGallery={handleClearGallery} />
                </div>
            </main>
        </div>
    );
};

export default App;