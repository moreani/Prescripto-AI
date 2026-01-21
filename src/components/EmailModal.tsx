'use client';

import { useState } from 'react';
import { Mail, X, Loader2, Check, AlertCircle } from 'lucide-react';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (email: string) => Promise<void>;
    isSending: boolean;
}

export function EmailModal({ isOpen, onClose, onSend, isSending }: EmailModalProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            await onSend(email);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setEmail('');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send email');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                        <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Email Your Notes
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            We'll send the PDF to your inbox
                        </p>
                    </div>
                </div>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-full mb-4">
                            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            Email Sent!
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                            Check your inbox for the prescription PDF
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Email input */}
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                disabled={isSending}
                                autoFocus
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* Privacy note */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            We won't store your email or use it for marketing. Your prescription is deleted after 24 hours.
                        </p>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-5 h-5" />
                                    Send PDF to Email
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
