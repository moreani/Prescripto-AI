import { FileText, AlertTriangle, Scale, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service - PrescriptoAI',
    description: 'Terms of Service and Medical Disclaimer for PrescriptoAI prescription reading service.',
};

export default function TermsPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl mb-6">
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Please read these terms carefully
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Last updated: January 2024
                    </p>
                </div>

                {/* Medical Disclaimer - PROMINENT */}
                <div className="not-prose mb-12">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-1">
                        <div className="bg-amber-50 dark:bg-amber-950 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-3">
                                        Important Medical Disclaimer
                                    </h2>
                                    <div className="space-y-3 text-amber-800 dark:text-amber-200">
                                        <p>
                                            <strong>PrescriptoAI is NOT a medical device and does NOT provide medical advice.</strong>
                                        </p>
                                        <p>
                                            This service is designed to help you understand prescription information by converting handwritten or printed prescriptions into readable text. It is an <strong>informational tool only</strong>.
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>Always verify medication information with your doctor or pharmacist</li>
                                            <li>Do not make medical decisions based solely on this service</li>
                                            <li>Report any discrepancies to your healthcare provider immediately</li>
                                            <li>Seek immediate medical attention for emergencies</li>
                                        </ul>
                                        <p className="font-medium">
                                            By using PrescriptoAI, you acknowledge that you understand this is not a substitute for professional medical advice, diagnosis, or treatment.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using PrescriptoAI (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        PrescriptoAI is a web-based tool that:
                    </p>
                    <ul>
                        <li>Converts images or PDFs of prescriptions into readable text using optical character recognition (OCR)</li>
                        <li>Extracts medication information and presents it in a structured format</li>
                        <li>Generates patient-friendly medication notes and schedules</li>
                        <li>Allows you to download notes as PDF documents</li>
                    </ul>

                    <h2>3. Limitations of Service</h2>
                    <div className="not-prose flex items-start gap-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl my-6">
                        <ShieldCheck className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">The Service Does NOT:</h4>
                            <ul className="text-red-800 dark:text-red-200 text-sm space-y-1">
                                <li>• Provide medical advice, diagnosis, or treatment recommendations</li>
                                <li>• Replace consultation with healthcare professionals</li>
                                <li>• Guarantee 100% accuracy in text extraction</li>
                                <li>• Verify the correctness of the prescription itself</li>
                                <li>• Check for drug interactions or contraindications</li>
                            </ul>
                        </div>
                    </div>

                    <h2>4. User Responsibilities</h2>
                    <p>By using the Service, you agree to:</p>
                    <ul>
                        <li>Verify all extracted information with your doctor or pharmacist before taking any medication</li>
                        <li>Use the Service only for legitimate personal use</li>
                        <li>Not upload content that violates others&apos; privacy or rights</li>
                        <li>Not attempt to circumvent any security measures</li>
                        <li>Report any errors or issues through the provided feedback mechanisms</li>
                    </ul>

                    <h2>5. Accuracy and Errors</h2>
                    <p>
                        While we strive for accuracy, OCR technology and AI-based extraction are not perfect. The Service may:
                    </p>
                    <ul>
                        <li>Misread handwritten text</li>
                        <li>Incorrectly extract medication names, dosages, or instructions</li>
                        <li>Miss information due to poor image quality</li>
                    </ul>
                    <p>
                        <strong>You are responsible for verifying all information</strong> before relying on it. We provide confidence indicators and &quot;needs confirmation&quot; flags to help you identify areas that may need review.
                    </p>

                    <h2>6. Intellectual Property</h2>
                    <p>
                        The Service, including its design, features, and content, is owned by PrescriptoAI and protected by intellectual property laws. You may not:
                    </p>
                    <ul>
                        <li>Copy, modify, or distribute the Service</li>
                        <li>Reverse engineer or attempt to extract source code</li>
                        <li>Use the Service for commercial purposes without permission</li>
                    </ul>

                    <h2>7. Limitation of Liability</h2>
                    <div className="not-prose flex items-start gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl my-6">
                        <Scale className="w-6 h-6 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-1" />
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-semibold mb-2">To the maximum extent permitted by law:</p>
                            <p>
                                PrescriptoAI and its affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service, including but not limited to damages for medical issues, errors in extracted information, or reliance on Service output.
                            </p>
                        </div>
                    </div>

                    <h2>8. Indemnification</h2>
                    <p>
                        You agree to indemnify and hold harmless PrescriptoAI from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
                    </p>

                    <h2>9. Service Availability</h2>
                    <p>
                        We strive to maintain Service availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue the Service at any time without notice.
                    </p>

                    <h2>10. Privacy</h2>
                    <p>
                        Your use of the Service is also governed by our <Link href="/privacy">Privacy Policy</Link>, which explains how we collect, use, and protect your information.
                    </p>

                    <h2>11. Changes to Terms</h2>
                    <p>
                        We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms. We encourage you to review these Terms periodically.
                    </p>

                    <h2>12. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved in the appropriate courts.
                    </p>

                    <h2>13. Contact</h2>
                    <p>
                        If you have questions about these Terms, please contact us through the feedback form on the website.
                    </p>

                    <hr />

                    <p className="text-center text-gray-500 dark:text-gray-400 italic">
                        By using PrescriptoAI, you acknowledge that you have read, understood, and agree to these Terms of Service and the Medical Disclaimer contained herein.
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
