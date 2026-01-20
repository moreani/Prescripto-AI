'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MedicationCard } from '@/components/MedicationCard';
import { ScheduleTable } from '@/components/ScheduleTable';
import { DisclaimerBanner, VerificationChecklist } from '@/components/DisclaimerBanner';
import { NotesOutput } from '@/lib/schema';
import {
    Loader2,
    Download,
    Printer,
    ThumbsUp,
    ThumbsDown,
    AlertTriangle,
    ArrowLeft,
    MessageCircle,
    Trash2,
    Check
} from 'lucide-react';

function NotesPageContent() {
    const searchParams = useSearchParams();
    const prescriptionId = searchParams.get('id');

    const [notes, setNotes] = useState<NotesOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [issueType, setIssueType] = useState<string>('');

    useEffect(() => {
        if (!prescriptionId) {
            setError('No prescription ID provided');
            setIsLoading(false);
            return;
        }

        const stored = sessionStorage.getItem(`prescriptoai_${prescriptionId}`);
        if (!stored) {
            setError('Notes not found. Please start over.');
            setIsLoading(false);
            return;
        }

        try {
            const data = JSON.parse(stored);
            if (data.notes) {
                setNotes(data.notes);
            } else {
                setError('Notes not generated yet. Please go back to review.');
            }
        } catch {
            setError('Failed to load notes');
        }

        setIsLoading(false);
    }, [prescriptionId]);

    const handleDownloadPDF = async () => {
        if (!notes) return;

        setIsDownloading(true);

        try {
            const response = await fetch('/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notes),
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const result = await response.json();

            // Create download link
            const link = document.createElement('a');
            link.href = result.pdf_base64;
            link.download = result.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError('Failed to download PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleFeedback = async (helpful: boolean) => {
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prescription_id: prescriptionId,
                    helpful,
                }),
            });
            setFeedbackSent(true);
        } catch {
            // Ignore feedback errors
        }
    };

    const handleSubmitIssue = async () => {
        if (!issueType) return;

        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prescription_id: prescriptionId,
                    helpful: false,
                    issue_type: issueType,
                    comment: feedbackComment,
                }),
            });
            setShowFeedbackForm(false);
            setFeedbackSent(true);
        } catch {
            // Ignore feedback errors
        }
    };

    const handleDeleteData = () => {
        if (prescriptionId) {
            sessionStorage.removeItem(`prescriptoai_${prescriptionId}`);
            window.location.href = '/';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !notes) {
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
                        Start Over
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-indigo-950 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-sm font-medium mb-4">
                        <Check className="w-4 h-4" />
                        Notes Generated Successfully
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Your Medication Notes
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review your medication schedule and instructions below
                    </p>
                </div>

                {/* Disclaimer Banner (Prominent) */}
                <DisclaimerBanner variant="prominent" className="mb-8" />

                {/* Medication Schedule */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Daily Medication Schedule
                    </h2>
                    <ScheduleTable schedule={notes.schedule} />
                </div>

                {/* Medication Details */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Medication Details
                    </h2>
                    <div className="space-y-4">
                        {notes.meds_display.map((med, index) => (
                            <MedicationCard
                                key={index}
                                medication={med}
                                index={index}
                                editable={false}
                            />
                        ))}
                    </div>
                </div>

                {/* Verification Checklist */}
                <VerificationChecklist className="mb-8" />

                {/* Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg transition-all disabled:opacity-50"
                        >
                            {isDownloading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Download className="w-5 h-5" />
                            )}
                            Download PDF
                        </button>

                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium border border-gray-200 dark:border-gray-600 transition-colors no-print"
                        >
                            <Printer className="w-5 h-5" />
                            Print
                        </button>

                        <button
                            onClick={handleDeleteData}
                            className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl font-medium border border-red-200 dark:border-red-800 transition-colors no-print"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete My Data
                        </button>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 no-print">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Was this helpful?
                    </h3>

                    {feedbackSent ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Check className="w-5 h-5" />
                            Thank you for your feedback!
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    onClick={() => handleFeedback(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg font-medium transition-colors"
                                >
                                    <ThumbsUp className="w-5 h-5" />
                                    Yes, helpful
                                </button>

                                <button
                                    onClick={() => {
                                        handleFeedback(false);
                                        setShowFeedbackForm(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg font-medium transition-colors"
                                >
                                    <ThumbsDown className="w-5 h-5" />
                                    Not really
                                </button>
                            </div>

                            {showFeedbackForm && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4" />
                                        Report an Issue
                                    </h4>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                What went wrong?
                                            </label>
                                            <select
                                                value={issueType}
                                                onChange={(e) => setIssueType(e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select an issue type</option>
                                                <option value="wrong_medication">Wrong medication name</option>
                                                <option value="wrong_dosage">Wrong dosage/strength</option>
                                                <option value="wrong_frequency">Wrong frequency/timing</option>
                                                <option value="missing_medication">Missing medication</option>
                                                <option value="ocr_error">Text not read correctly</option>
                                                <option value="other">Other issue</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Additional details (optional)
                                            </label>
                                            <textarea
                                                value={feedbackComment}
                                                onChange={(e) => setFeedbackComment(e.target.value)}
                                                rows={3}
                                                placeholder="Please describe the issue..."
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                                            />
                                        </div>

                                        <button
                                            onClick={handleSubmitIssue}
                                            disabled={!issueType}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Submit Report
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Start Over */}
                <div className="text-center mt-8">
                    <Link
                        href="/upload"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Upload Another Prescription
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function NotesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <NotesPageContent />
        </Suspense>
    );
}
