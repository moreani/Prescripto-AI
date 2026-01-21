'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail, Upload, Home, Loader2, Download } from 'lucide-react';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const isDownloadMode = searchParams.get('download') === 'true';

    const [showCheckmark, setShowCheckmark] = useState(false);

    useEffect(() => {
        // Animate checkmark on mount
        const timer = setTimeout(() => setShowCheckmark(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-950 dark:to-emerald-950 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full text-center">
                {/* Success Icon */}
                <div className={`
                    mb-8 transition-all duration-500 ease-out
                    ${showCheckmark ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
                `}>
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
                        <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Success Message */}
                <div className={`
                    transition-all duration-500 delay-200
                    ${showCheckmark ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Your Prescription is Ready!
                    </h1>

                    {isDownloadMode ? (
                        <>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                Your medication schedule has been downloaded as a PDF.
                            </p>

                            {/* Download Confirmation */}
                            <div className="flex items-center justify-center gap-2 mb-8 mt-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="font-medium text-gray-900 dark:text-white">PDF Downloaded</span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                                Check your downloads folder for the prescription PDF.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                We've converted your prescription and sent the medication schedule to:
                            </p>

                            {/* Email Display */}
                            {email && (
                                <div className="flex items-center justify-center gap-2 mb-8 mt-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-gray-900 dark:text-white">{email}</span>
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                                Please check your inbox (and spam folder) for the PDF with your medication schedule.
                            </p>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className={`
                    space-y-4 transition-all duration-500 delay-400
                    ${showCheckmark ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}>
                    <Link
                        href="/upload"
                        className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Another Prescription
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-12">
                    This summary is for informational purposes only. Always verify with your doctor or pharmacist.
                </p>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
