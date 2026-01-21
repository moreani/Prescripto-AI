'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UploadDropzone } from '@/components/UploadDropzone';
import {
    ArrowRight,
    Loader2,
    Info,
    AlertTriangle,
    Mail,
    FileText,
    CheckCircle,
    Download
} from 'lucide-react';

interface ProcessingStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'complete' | 'error';
}

// Helper function to safely extract error message from response
async function getErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
        const data = await response.json();
        return data.error || fallback;
    } catch {
        // Response was not valid JSON, try to get text
        try {
            const text = await response.text();
            if (text) return text;
        } catch {
            // Ignore text parsing errors
        }
    }
    return fallback;
}

function UploadPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cameraMode = searchParams.get('camera') === 'true';

    const [files, setFiles] = useState<File[]>([]);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isTestMode, setIsTestMode] = useState(false);
    const [configLoaded, setConfigLoaded] = useState(false);

    // Fetch config on mount
    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                setIsTestMode(data.testMode);
                setConfigLoaded(true);
            })
            .catch(() => {
                setConfigLoaded(true); // Default to email mode on error
            });
    }, []);

    const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
        { id: 'ocr', label: 'Reading prescription...', status: 'pending' },
        { id: 'extract', label: 'Extracting medications...', status: 'pending' },
        { id: 'notes', label: 'Generating schedule...', status: 'pending' },
        { id: 'final', label: 'Preparing PDF...', status: 'pending' },
    ]);

    const handleFileSelect = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        setError(null);
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (value && !validateEmail(value)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError(null);
        }
    };

    const updateStepStatus = (stepId: string, status: ProcessingStep['status']) => {
        setProcessingSteps(prev =>
            prev.map(step =>
                step.id === stepId ? { ...step, status } : step
            )
        );
    };

    const getProgress = (): number => {
        const completed = processingSteps.filter(s => s.status === 'complete').length;
        const active = processingSteps.filter(s => s.status === 'active').length;
        return ((completed + active * 0.5) / processingSteps.length) * 100;
    };

    const handleConvert = async () => {
        if (files.length === 0) {
            setError('Please select a prescription image to continue.');
            return;
        }

        // Only validate email if not in test mode
        if (!isTestMode && (!email || !validateEmail(email))) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setIsProcessing(true);
        setError(null);

        // Reset all steps to pending
        setProcessingSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));

        try {
            // Step 1: OCR - Process all files
            updateStepStatus('ocr', 'active');

            let combinedOcrText = '';
            let prescriptionId = '';

            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('file', files[i]);
                formData.append('mimeType', files[i].type);

                const ocrResponse = await fetch('/api/ocr', {
                    method: 'POST',
                    body: formData,
                });

                if (!ocrResponse.ok) {
                    const errorMessage = await getErrorMessage(ocrResponse, `Failed to read prescription page ${i + 1}`);
                    throw new Error(errorMessage);
                }

                const ocrResult = await ocrResponse.json();

                // Use first file's prescription ID
                if (i === 0) {
                    prescriptionId = ocrResult.prescription_id;
                }

                // Combine OCR text from all pages
                combinedOcrText += `--- Page ${i + 1} ---\n${ocrResult.ocr_text}\n\n`;
            }

            updateStepStatus('ocr', 'complete');

            // Step 2: Extract medications
            updateStepStatus('extract', 'active');
            const extractResponse = await fetch('/api/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prescription_id: prescriptionId,
                    ocr_text: combinedOcrText,
                    locale: 'en',
                }),
            });

            if (!extractResponse.ok) {
                const errorMessage = await getErrorMessage(extractResponse, 'Failed to extract medications');
                throw new Error(errorMessage);
            }

            const extractResult = await extractResponse.json();
            updateStepStatus('extract', 'complete');

            // Step 3: Generate notes
            updateStepStatus('notes', 'active');
            const notesResponse = await fetch('/api/generate-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prescription_id: extractResult.prescription_id,
                    medications: extractResult.medications,
                    follow_up: extractResult.follow_up,
                    tests: extractResult.tests,
                }),
            });

            if (!notesResponse.ok) {
                const errorMessage = await getErrorMessage(notesResponse, 'Failed to generate schedule');
                throw new Error(errorMessage);
            }

            const notesResult = await notesResponse.json();
            updateStepStatus('notes', 'complete');

            // Step 4: Either download PDF (test mode) or send email
            updateStepStatus('final', 'active');

            if (isTestMode) {
                // Test mode: Download PDF directly
                const pdfResponse = await fetch('/api/export/pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(notesResult),
                });

                if (!pdfResponse.ok) {
                    const errorMessage = await getErrorMessage(pdfResponse, 'Failed to generate PDF');
                    throw new Error(errorMessage);
                }

                // Get PDF data and trigger download
                const pdfData = await pdfResponse.json();

                // Convert base64 data URI to blob
                const base64Data = pdfData.pdf_base64.split(',')[1];
                const binaryData = atob(base64Data);
                const bytes = new Uint8Array(binaryData.length);
                for (let i = 0; i < binaryData.length; i++) {
                    bytes[i] = binaryData.charCodeAt(i);
                }
                const pdfBlob = new Blob([bytes], { type: 'application/pdf' });

                const url = window.URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = pdfData.filename || `prescription-${prescriptionId.slice(0, 8)}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                updateStepStatus('final', 'complete');

                // Redirect to success page (download mode)
                setTimeout(() => {
                    router.push(`/success?download=true`);
                }, 500);
            } else {
                // Production mode: Send email
                const emailResponse = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        notes: notesResult,
                    }),
                });

                if (!emailResponse.ok) {
                    const errorMessage = await getErrorMessage(emailResponse, 'Failed to send email');
                    throw new Error(errorMessage);
                }

                updateStepStatus('final', 'complete');

                // Redirect to success page (email mode)
                setTimeout(() => {
                    router.push(`/success?email=${encodeURIComponent(email)}`);
                }, 500);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);

            // Mark the active step as error
            setProcessingSteps(prev =>
                prev.map(step =>
                    step.status === 'active' ? { ...step, status: 'error' } : step
                )
            );
            setIsProcessing(false);
        }
    };

    // Form is valid if files selected AND (test mode OR valid email)
    const isFormValid = files.length > 0 && (isTestMode || (email && validateEmail(email))) && !isProcessing;

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
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <UploadDropzone
                        onFileSelect={handleFileSelect}
                        enableCamera={true}
                        maxFiles={5}
                        maxSizeMB={20}
                    />
                </div>

                {/* Email Input - Shows after file selection (only in email mode) */}
                {files.length > 0 && !isTestMode && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Where should we send your PDF?
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    We'll email you the medication schedule
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="your@email.com"
                                disabled={isProcessing}
                                className={`
                                    w-full px-4 py-3 rounded-xl border-2 transition-all
                                    bg-gray-50 dark:bg-gray-900
                                    text-gray-900 dark:text-white
                                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                                    focus:outline-none focus:ring-0
                                    ${emailError
                                        ? 'border-red-300 dark:border-red-700 focus:border-red-500'
                                        : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                                    }
                                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            />
                            {email && validateEmail(email) && !emailError && (
                                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                            )}
                        </div>
                        {emailError && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{emailError}</p>
                        )}
                    </div>
                )}

                {/* Test Mode Notice */}
                {files.length > 0 && isTestMode && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 animate-fadeIn">
                        <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <div>
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                                    Test Mode Active
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    PDF will be downloaded directly to your device
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Processing Overlay - Full screen centered */}
                {isProcessing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50/95 to-blue-50/95 dark:from-gray-950/95 dark:to-indigo-950/95 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-10 max-w-md w-full mx-4 animate-fadeIn">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Converting your prescription...
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Please wait while we process your files
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${getProgress()}%` }}
                                />
                            </div>

                            {/* Steps */}
                            <div className="space-y-3">
                                {processingSteps.map((step) => (
                                    <div
                                        key={step.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${step.status === 'active'
                                            ? 'bg-blue-50 dark:bg-blue-950/30'
                                            : step.status === 'complete'
                                                ? 'bg-green-50 dark:bg-green-950/30'
                                                : step.status === 'error'
                                                    ? 'bg-red-50 dark:bg-red-950/30'
                                                    : ''
                                            }`}
                                    >
                                        {step.status === 'pending' && (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                        )}
                                        {step.status === 'active' && (
                                            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                                        )}
                                        {step.status === 'complete' && (
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        )}
                                        {step.status === 'error' && (
                                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        )}
                                        <span className={`text-sm ${step.status === 'active'
                                            ? 'text-blue-700 dark:text-blue-300 font-medium'
                                            : step.status === 'complete'
                                                ? 'text-green-700 dark:text-green-300'
                                                : step.status === 'error'
                                                    ? 'text-red-700 dark:text-red-300'
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Convert Button */}
                <button
                    onClick={handleConvert}
                    disabled={!isFormValid}
                    className={`
                        w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all
                        ${isFormValid
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <FileText className="w-5 h-5" />
                            Convert to PDF
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>

                {/* Privacy note */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    Your prescription is processed securely. Files are automatically deleted after processing.
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
