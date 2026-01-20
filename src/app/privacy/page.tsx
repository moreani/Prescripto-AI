import { Shield, Lock, Trash2, Eye, Server, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy - PrescriptoAI',
    description: 'Learn how PrescriptoAI protects your privacy and handles your prescription data.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-2xl mb-6">
                        <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Your privacy is our priority
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Last updated: January 2024
                    </p>
                </div>

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">

                    {/* Key Points */}
                    <div className="not-prose grid sm:grid-cols-2 gap-4 mb-12">
                        {[
                            { icon: Lock, title: 'Secure Processing', desc: 'All uploads are encrypted via HTTPS' },
                            { icon: Clock, title: '24-Hour Retention', desc: 'Data automatically deleted after 24 hours' },
                            { icon: Trash2, title: 'Delete Anytime', desc: 'You can delete your data immediately' },
                            { icon: Eye, title: 'No Selling Data', desc: 'We never sell your personal information' },
                        ].map((item, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <item.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2>1. Information We Collect</h2>
                    <p>
                        When you use PrescriptoAI, we process the following information:
                    </p>
                    <ul>
                        <li><strong>Prescription Images/PDFs:</strong> The files you upload for processing</li>
                        <li><strong>Extracted Text:</strong> Text extracted from your prescription via OCR</li>
                        <li><strong>Technical Data:</strong> Basic device information (browser type, device type) for service improvement</li>
                    </ul>
                    <p>
                        We do <strong>not</strong> collect:
                    </p>
                    <ul>
                        <li>Your name, email, or contact information (unless you provide it voluntarily for feedback)</li>
                        <li>Location data</li>
                        <li>Persistent identifiers across sessions</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>Your prescription data is used solely to:</p>
                    <ul>
                        <li>Extract medication information from the uploaded image/PDF</li>
                        <li>Generate patient-friendly medication notes</li>
                        <li>Create downloadable PDF summaries</li>
                    </ul>
                    <p>
                        We do <strong>not</strong> use your prescription data for advertising, marketing, or any purpose unrelated to providing the service.
                    </p>

                    <h2>3. Data Storage & Retention</h2>
                    <div className="not-prose flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl my-6">
                        <Server className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Data Retention Policy</h4>
                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                All prescription data is automatically deleted within <strong>24 hours</strong>. You can also delete your data immediately using the &quot;Delete My Data&quot; button on the notes page.
                            </p>
                        </div>
                    </div>
                    <ul>
                        <li>Prescription images are processed in memory and not stored permanently</li>
                        <li>Session data is stored locally in your browser and cleared when you close it</li>
                        <li>We do not maintain copies of your prescriptions</li>
                    </ul>

                    <h2>4. Data Security</h2>
                    <p>We implement industry-standard security measures:</p>
                    <ul>
                        <li>All data is transmitted via HTTPS encryption</li>
                        <li>Processing occurs in secure, isolated environments</li>
                        <li>We follow the principle of least privilege for data access</li>
                        <li>No sensitive data is stored in logs or analytics</li>
                    </ul>

                    <h2>5. Third-Party Services</h2>
                    <p>
                        We use Google&apos;s Gemini AI for text extraction and analysis. When processing your prescription:
                    </p>
                    <ul>
                        <li>Data is sent securely to Google&apos;s API for processing</li>
                        <li>Google processes the data according to their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                        <li>We do not share data with any other third parties</li>
                    </ul>

                    <h2>6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li><strong>Delete</strong> your data at any time using the provided controls</li>
                        <li><strong>Access</strong> your notes during your session</li>
                        <li><strong>Download</strong> your medication notes as a PDF</li>
                        <li><strong>Close the session</strong> to clear all data from your browser</li>
                    </ul>

                    <h2>7. Children&apos;s Privacy</h2>
                    <p>
                        PrescriptoAI is not intended for use by children under 13. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us.
                    </p>

                    <h2>8. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                    </p>

                    <h2>9. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or our practices, please contact us through the feedback form on the website.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
                    <Link
                        href="/"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
