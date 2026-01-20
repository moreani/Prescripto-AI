'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react';

interface DisclaimerBannerProps {
    variant?: 'default' | 'prominent' | 'compact';
    className?: string;
}

export function DisclaimerBanner({
    variant = 'default',
    className = '',
}: DisclaimerBannerProps) {
    const disclaimerText = "This summary is for informational purposes only. It does NOT constitute medical advice. Always verify with your doctor or pharmacist before taking any medication.";

    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-400 text-amber-800 dark:text-amber-200 text-sm ${className}`}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <p>Not medical advice. Verify with your doctor/pharmacist.</p>
            </div>
        );
    }

    if (variant === 'prominent') {
        return (
            <div className={`rounded-xl overflow-hidden border-2 border-amber-300 dark:border-amber-600 ${className}`}>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg">Important Medical Disclaimer</h3>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4">
                    <p className="text-amber-900 dark:text-amber-100 mb-3">
                        {disclaimerText}
                    </p>
                    <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                        <div className="flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span>Confirm drug names, strengths, and dosages with the original prescription</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span>Consult your pharmacist about potential drug interactions</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span>Contact your doctor if you have questions about your treatment</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span>Seek immediate medical care for severe reactions</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className={`flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-xl ${className}`}>
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Medical Disclaimer</h4>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                    {disclaimerText}
                </p>
            </div>
        </div>
    );
}

// Safety reminder for high-risk medications
interface SafetyReminderProps {
    medicationName: string;
    className?: string;
}

export function SafetyReminder({ medicationName, className = '' }: SafetyReminderProps) {
    return (
        <div className={`flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
            <Info className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
                <h4 className="font-medium text-red-900 dark:text-red-100 text-sm">Safety Reminder</h4>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    <strong>{medicationName}</strong> may require special precautions. Please consult your pharmacist or doctor for guidance on proper use, storage, and potential interactions.
                </p>
            </div>
        </div>
    );
}

// Verification checklist
export function VerificationChecklist({ className = '' }: { className?: string }) {
    const items = [
        'Drug name matches your prescription',
        'Strength and dose are correct',
        'Frequency and timing are accurate',
        'Duration of treatment is confirmed',
        'Food instructions are clear',
        'No allergies or contraindications',
    ];

    return (
        <div className={`p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl ${className}`}>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Verification Checklist
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Before taking your medications, please verify:
            </p>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
