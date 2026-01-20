'use client';

import React from 'react';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfidenceChipProps {
    confidence: number;
    compact?: boolean;
    showLabel?: boolean;
}

export function ConfidenceChip({
    confidence,
    compact = false,
    showLabel = false,
}: ConfidenceChipProps) {
    const getConfidenceLevel = (score: number): { label: string; color: string; icon: React.ReactNode; bgColor: string } => {
        if (score >= 0.85) {
            return {
                label: 'High confidence',
                color: 'text-green-700 dark:text-green-400',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
                icon: <CheckCircle className={compact ? 'w-3 h-3' : 'w-4 h-4'} />,
            };
        } else if (score >= 0.7) {
            return {
                label: 'Medium confidence',
                color: 'text-amber-700 dark:text-amber-400',
                bgColor: 'bg-amber-100 dark:bg-amber-900/30',
                icon: <HelpCircle className={compact ? 'w-3 h-3' : 'w-4 h-4'} />,
            };
        } else {
            return {
                label: 'Needs confirmation',
                color: 'text-red-600 dark:text-red-400',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
                icon: <AlertCircle className={compact ? 'w-3 h-3' : 'w-4 h-4'} />,
            };
        }
    };

    const { label, color, bgColor, icon } = getConfidenceLevel(confidence);
    const percentage = Math.round(confidence * 100);

    if (compact) {
        return (
            <span
                className={`inline-flex items-center gap-1 ${color}`}
                title={`${label} (${percentage}%)`}
            >
                {icon}
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${color} ${bgColor}`}
        >
            {icon}
            {showLabel ? label : `${percentage}%`}
        </span>
    );
}

// Needs confirmation badge
interface NeedsConfirmationBadgeProps {
    fields: string[];
}

export function NeedsConfirmationBadge({ fields }: NeedsConfirmationBadgeProps) {
    if (fields.length === 0) return null;

    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
                {fields.length} field{fields.length > 1 ? 's' : ''} need{fields.length === 1 ? 's' : ''} confirmation
            </span>
        </div>
    );
}

// Confidence bar visualization
interface ConfidenceBarProps {
    confidence: number;
    label?: string;
}

export function ConfidenceBar({ confidence, label }: ConfidenceBarProps) {
    const percentage = Math.round(confidence * 100);

    const getBarColor = (score: number): string => {
        if (score >= 0.85) return 'bg-green-500';
        if (score >= 0.7) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{percentage}%</span>
                </div>
            )}
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getBarColor(confidence)} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
