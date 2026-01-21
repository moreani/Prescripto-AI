'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MedicationCard } from '@/components/MedicationCard';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { PrescriptionExtract, Medication } from '@/lib/schema';
import {
    ArrowRight,
    Loader2,
    ChevronDown,
    ChevronUp,
    Edit2,
    AlertTriangle,
    FileText,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

function ReviewPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const prescriptionId = searchParams.get('id');

    const [extract, setExtract] = useState<PrescriptionExtract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showOcrText, setShowOcrText] = useState(false);
    const [editedOcrText, setEditedOcrText] = useState('');

    useEffect(() => {
        if (!prescriptionId) {
            setError('No prescription ID provided');
            setIsLoading(false);
            return;
        }

        // Get data from session storage
        const stored = sessionStorage.getItem(`prescriptoai_${prescriptionId}`);
        if (!stored) {
            setError('Prescription not found. Please upload again.');
            setIsLoading(false);
            return;
        }

        try {
            const data = JSON.parse(stored);
            setExtract(data.extract);
            setEditedOcrText(data.extract.ocr_text);
        } catch {
            setError('Failed to load prescription data');
        }

        setIsLoading(false);
    }, [prescriptionId]);

    const handleMedicationUpdate = (index: number, updated: Medication) => {
        if (!extract) return;

        const newMedications = [...extract.medications];
        newMedications[index] = updated;

        const newExtract = { ...extract, medications: newMedications };
        setExtract(newExtract);

        // Update session storage
        sessionStorage.setItem(
            `prescriptoai_${prescriptionId}`,
            JSON.stringify({
                extract: newExtract,
                createdAt: new Date().toISOString(),
            })
        );
    };

    const handleGenerateNotes = async () => {
        if (!extract) return;

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prescription_id: extract.prescription_id,
                    medications: extract.medications,
                    follow_up: extract.follow_up,
                    tests: extract.tests,
                }),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to generate notes';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // Response was not valid JSON, try to get text
                    try {
                        const text = await response.text();
                        if (text) errorMessage = text;
                    } catch {
                        // Ignore text parsing errors
                    }
                }
                throw new Error(errorMessage);
            }

            const notes = await response.json();

            // Store notes in session storage
            const stored = sessionStorage.getItem(`prescriptoai_${prescriptionId}`);
            if (stored) {
                const data = JSON.parse(stored);
                data.notes = notes;
                sessionStorage.setItem(`prescriptoai_${prescriptionId}`, JSON.stringify(data));
            }

            // Navigate to notes page
            router.push(`/notes?id=${prescriptionId}`);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            setIsGenerating(false);
        }
    };

    const confirmationsNeeded = extract?.medications.filter(m => m.needs_confirmation.length > 0).length || 0;

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !extract) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {error || 'Something went wrong'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please try uploading your prescription again.
                    </p>
                    <Link
                        href="/upload"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Upload Again
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-indigo-950 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Review & Fix
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Verify the extracted medications and correct any errors before generating notes
                    </p>
                </div>

                {/* Confirmation warning */}
                {confirmationsNeeded > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-xl mb-6">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                                {confirmationsNeeded} medication{confirmationsNeeded > 1 ? 's' : ''} need{confirmationsNeeded === 1 ? 's' : ''} your attention
                            </h3>
                            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                Some fields could not be read clearly. Please review and correct the highlighted items.
                            </p>
                        </div>
                    </div>
                )}

                {/* OCR Text (Collapsible) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6 overflow-hidden">
                    <button
                        onClick={() => setShowOcrText(!showOcrText)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Edit2 className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-white">Edit OCR Text</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">(Advanced)</span>
                        </div>
                        {showOcrText ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                    </button>

                    {showOcrText && (
                        <div className="px-6 pb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                This is the raw text extracted from your prescription. Edit if needed and the changes will be reflected in the medications.
                            </p>
                            <textarea
                                value={editedOcrText}
                                onChange={(e) => setEditedOcrText(e.target.value)}
                                rows={10}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* Medications */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Extracted Medications ({extract.medications.length})
                    </h2>

                    <div className="space-y-4">
                        {extract.medications.map((med, index) => (
                            <MedicationCard
                                key={index}
                                medication={med}
                                index={index}
                                editable={true}
                                onUpdate={(updated) => handleMedicationUpdate(index, updated)}
                            />
                        ))}
                    </div>
                </div>

                {/* Follow-up & Tests */}
                {(extract.follow_up || (extract.tests && extract.tests.length > 0)) && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h3>

                        {extract.follow_up && (
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Follow-up</p>
                                <p className="text-gray-900 dark:text-white">{extract.follow_up}</p>
                            </div>
                        )}

                        {extract.tests && extract.tests.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tests / Investigations</p>
                                <ul className="space-y-1">
                                    {extract.tests.map((test, i) => (
                                        <li key={i} className="text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                            {test}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Disclaimer */}
                <DisclaimerBanner variant="compact" className="mb-8" />

                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/upload"
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium border border-gray-200 dark:border-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Upload Different
                    </Link>

                    <button
                        onClick={handleGenerateNotes}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating Notes...
                            </>
                        ) : (
                            <>
                                Generate Notes
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <ReviewPageContent />
        </Suspense>
    );
}
