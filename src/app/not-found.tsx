import Link from 'next/link';
import { FileQuestion, Home, Upload } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-indigo-950">
            <div className="text-center max-w-md mx-auto px-4">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-8">
                    <FileQuestion className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>

                {/* Error code */}
                <h1 className="text-8xl font-bold text-gray-200 dark:text-gray-800 mb-4">
                    404
                </h1>

                {/* Message */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Page Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>

                    <Link
                        href="/upload"
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium border border-gray-200 dark:border-gray-700 transition-colors"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Prescription
                    </Link>
                </div>
            </div>
        </div>
    );
}
