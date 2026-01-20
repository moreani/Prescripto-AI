'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, Camera, FileImage, X, AlertCircle } from 'lucide-react';

interface UploadDropzoneProps {
    onFileSelect: (files: File[]) => void;
    accept?: string;
    maxFiles?: number;
    maxSizeMB?: number;
    enableCamera?: boolean;
}

export function UploadDropzone({
    onFileSelect,
    accept = 'image/jpeg,image/png,image/webp,application/pdf',
    maxFiles = 5,
    maxSizeMB = 20,
    enableCamera = true,
}: UploadDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `${file.name} is too large (max ${maxSizeMB}MB)`;
        }
        const acceptedTypes = accept.split(',').map(t => t.trim());
        if (!acceptedTypes.some(type => file.type.match(type.replace('*', '.*')))) {
            return `${file.name} is not a supported file type`;
        }
        return null;
    };

    const handleFiles = useCallback((files: FileList | File[]) => {
        setError(null);
        const fileArray = Array.from(files);

        if (selectedFiles.length + fileArray.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        const validFiles: File[] = [];
        for (const file of fileArray) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            validFiles.push(file);
        }

        const newFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newFiles);
        onFileSelect(newFiles);
    }, [selectedFiles, maxFiles, maxSizeMB, accept, onFileSelect]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFileSelect(newFiles);
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const openCamera = () => {
        cameraInputRef.current?.click();
    };

    return (
        <div className="w-full">
            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={maxFiles > 1}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
            />

            {/* Main dropzone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
        `}
                onClick={openFileDialog}
            >
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-colors
            ${isDragging ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}
          `}>
                        <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`} />
                    </div>

                    <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            Drop your prescription here
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            or click to browse files
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FileImage className="w-4 h-4" />
                        <span>JPG, PNG, WebP, or PDF (max {maxSizeMB}MB)</span>
                    </div>
                </div>
            </div>

            {/* Camera button for mobile */}
            {enableCamera && (
                <button
                    onClick={(e) => { e.stopPropagation(); openCamera(); }}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                >
                    <Camera className="w-5 h-5" />
                    Take Photo
                </button>
            )}

            {/* Error message */}
            {error && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Selected files preview */}
            {selectedFiles.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Selected Files ({selectedFiles.length})
                    </h3>
                    <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                        <FileImage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
