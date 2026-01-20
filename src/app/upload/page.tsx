'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UploadDropzone } from '@/components/UploadDropzone';
import { ArrowRight, Loader2, FileCheck, AlertTriangle, Info } from 'lucide-react';

function UploadPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cameraMode = searchParams.get('camera') === 'true';

    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingStep, setProcessingStep] = useState<string>('');

    const handleFileSelect = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        setError(null);
    };

    const handleContinue = async () => {
        if (files.length === 0) {
            setError('Please select at least one file to continue.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Step 1: OCR
            setProcessingStep('Reading prescription...');
            const formData = new FormData();
            formData.append('file', files[0]);
            formData.append('mimeType', files[0].type);

            const ocrResponse = await fetch('/api/ocr', {
                method: 'POST',
                body: formData,
            });

            if (!ocrResponse.ok) {
                const errorData = await ocrResponse.json();
                throw new Error(errorData.error || 'Failed to process image');
            }

            const ocrResult = await ocrResponse.json();

            // Step 2: Extract medications
            setProcessingStep('Extracting medications...');
            const extractResponse = await fetch('/api/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prescription_id: ocrResult.prescription_id,
                    ocr_text: ocrResult.ocr_text,
                    locale: 'en',
                }),
            });

            if (!extractResponse.ok) {
                const errorData = await extractResponse.json();
                throw new Error(errorData.error || 'Failed to extract medications');
            }

            const extractResult = await extractResponse.json();

            // Store in session storage
            sessionStorage.setItem(
                `prescriptoai_${extractResult.prescription_id}`,
                JSON.stringify({
                    extract: extractResult,
                    createdAt: new Date().toISOString(),
                })
            );

            // Navigate to review page
            router.push(`/review?id=${extractResult.prescription_id}`);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-indigo-950 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Upload Your Prescription
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Take a photo or upload an image/PDF of your prescription
                    </p>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Tips for best results</h3>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <li>• Ensure good lighting and avoid shadows</li>
                                <li>• Include the full prescription page</li>
                                <li>• Make sure text is readable and not blurry</li>
                                <li>• Supports JPG, PNG, WebP, and PDF formats</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
                    <UploadDropzone
                        onFileSelect={handleFileSelect}
                        enableCamera={true}
                        maxFiles={5}
                        maxSizeMB={20}
                    />
                </div>

                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-8">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={files.length === 0 || isProcessing}
                    className={`
            w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all
            ${files.length > 0 && !isProcessing
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }
          `}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {processingStep}
                        </>
                    ) : (
                        <>
                            <FileCheck className="w-5 h-5" />
                            Continue to Review
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>

                {/* Privacy note */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    Your prescription is processed securely. Files are automatically deleted after 24 hours.
                </p>
            </div>
        </div>
    );
}

export default function UploadPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <UploadPageContent />
        </Suspense>
    );
}
