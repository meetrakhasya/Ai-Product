import React from 'react';
import type { AspectRatio } from '../types';
import { aspectRatios } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface ControlPanelProps {
    productImages: File[];
    setProductImages: (files: File[]) => void;
    referenceImage: File[];
    setReferenceImage: (files: File[]) => void;
    concept: string;
    setConcept: (concept: string) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    editPrompt: string;
    setEditPrompt: (prompt: string) => void;
    onGenerate: () => void;
    onEdit: () => void;
    isGenerating: boolean;
    isEditing: boolean;
    isSuggestingConcept: boolean;
    isPosterGenerated: boolean;
}

const FileInput: React.FC<{
    id: string;
    label: string;
    files: File[];
    onChange: (files: File[]) => void;
    multiple?: boolean;
}> = ({ id, label, files, onChange, multiple = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-cyan-300 mb-2">{label}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-600 hover:border-cyan-400 transition-colors">
            <div className="space-y-1 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                <div className="flex text-sm text-gray-400">
                    <label htmlFor={id} className="relative cursor-pointer bg-transparent rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-cyan-500">
                        <span>Upload file(s)</span>
                        <input id={id} name={id} type="file" className="sr-only" accept="image/*" multiple={multiple} onChange={(e) => onChange(e.target.files ? Array.from(e.target.files) : [])} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                {files.length > 0 ? (
                    <p className="text-xs text-green-400 mt-2 truncate max-w-xs">
                        {files.length === 1 ? files[0].name : `${files.length} files selected`}
                    </p>
                ) : (
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                )}
            </div>
        </div>
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
    productImages, setProductImages, referenceImage, setReferenceImage, concept, setConcept,
    aspectRatio, setAspectRatio, editPrompt, setEditPrompt, onGenerate, onEdit,
    isGenerating, isEditing, isSuggestingConcept, isPosterGenerated
}) => {
    return (
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 space-y-6 h-full shadow-lg shadow-cyan-500/10">
            <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-cyan-400/20 pb-2">Controls</h2>
            
            <div className="space-y-4">
                <FileInput id="product-image" label="1. Product Image(s)" files={productImages} onChange={setProductImages} multiple />
                <FileInput id="reference-image" label="2. Style Reference (Optional)" files={referenceImage} onChange={setReferenceImage} />
            </div>

            <div>
                <label htmlFor="concept" className="block text-sm font-medium text-cyan-300">3. Poster Concept</label>
                <textarea
                    id="concept"
                    rows={3}
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    disabled={isSuggestingConcept}
                    className="mt-2 block w-full bg-gray-800/70 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 disabled:opacity-70"
                    placeholder={isSuggestingConcept ? "AI is generating a concept..." : "e.g., 'A futuristic city at night with neon lights'"}
                />
            </div>
            
            <div>
                 <label className="block text-sm font-medium text-cyan-300 mb-2">4. Aspect Ratio</label>
                 <div className="grid grid-cols-5 gap-2">
                    {aspectRatios.map(ratio => (
                        <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`py-2 text-sm rounded-md transition-all ${aspectRatio === ratio ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/30' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {ratio}
                        </button>
                    ))}
                 </div>
            </div>

            <button
                onClick={onGenerate}
                disabled={productImages.length === 0 || !concept || isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
                <MagicWandIcon className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Generate Poster'}
            </button>
            
            {isPosterGenerated && (
                <div className="pt-4 border-t border-gray-700 space-y-4">
                     <h3 className="text-xl font-semibold text-cyan-400">Iterate & Refine</h3>
                     <div>
                        <label htmlFor="edit-prompt" className="block text-sm font-medium text-cyan-300">Edit Instruction</label>
                        <textarea
                            id="edit-prompt"
                            rows={2}
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            className="mt-2 block w-full bg-gray-800/70 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                            placeholder="e.g., 'Change the background to a beach'"
                        />
                    </div>
                     <button
                        onClick={onEdit}
                        disabled={!editPrompt || isEditing}
                        className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEditing ? 'Applying...' : 'Apply Edit'}
                    </button>
                </div>
            )}
        </div>
    );
};