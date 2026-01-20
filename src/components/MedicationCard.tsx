'use client';

import React, { useState } from 'react';
import { Medication } from '@/lib/schema';
import { formatFrequency, formatFoodInstruction, expandAbbreviation } from '@/lib/abbreviations';
import { ConfidenceChip } from './ConfidenceChip';
import { ChevronDown, ChevronUp, Edit2, Check, X, AlertTriangle, Pill } from 'lucide-react';

interface MedicationCardProps {
    medication: Medication;
    index: number;
    editable?: boolean;
    onUpdate?: (updated: Medication) => void;
}

export function MedicationCard({
    medication,
    index,
    editable = false,
    onUpdate,
}: MedicationCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(medication);

    const hasConfirmationNeeded = medication.needs_confirmation.length > 0;

    const handleSave = () => {
        onUpdate?.(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData(medication);
        setIsEditing(false);
    };

    const updateField = (field: keyof Medication, value: string | number | null) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className={`
      rounded-xl border overflow-hidden transition-all duration-200
      ${hasConfirmationNeeded
                ? 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }
    `}>
            {/* Header */}
            <div
                className={`
          px-4 py-3 flex items-center justify-between cursor-pointer
          ${hasConfirmationNeeded
                        ? 'bg-amber-100/50 dark:bg-amber-900/30'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }
        `}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${hasConfirmationNeeded
                            ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                            : 'bg-white/20 text-white'
                        }
          `}>
                        {index + 1}
                    </div>
                    <div>
                        <h3 className={`font-semibold ${hasConfirmationNeeded ? 'text-amber-900 dark:text-amber-100' : 'text-white'}`}>
                            {medication.name}
                            {medication.strength && <span className="font-normal ml-2">{medication.strength}</span>}
                        </h3>
                        <p className={`text-sm ${hasConfirmationNeeded ? 'text-amber-700 dark:text-amber-300' : 'text-white/80'}`}>
                            {medication.form || 'Form not specified'} • {formatFrequency(medication.frequency)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasConfirmationNeeded && (
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                    {isExpanded ? (
                        <ChevronUp className={`w-5 h-5 ${hasConfirmationNeeded ? 'text-amber-700' : 'text-white'}`} />
                    ) : (
                        <ChevronDown className={`w-5 h-5 ${hasConfirmationNeeded ? 'text-amber-700' : 'text-white'}`} />
                    )}
                </div>
            </div>

            {/* Body */}
            {isExpanded && (
                <div className="p-4 space-y-4">
                    {/* Confirmation warning */}
                    {hasConfirmationNeeded && (
                        <div className="flex items-start gap-2 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-800 dark:text-amber-200">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Please verify the following fields:</p>
                                <p className="text-sm opacity-80">{medication.needs_confirmation.join(', ')}</p>
                            </div>
                        </div>
                    )}

                    {/* Edit/View Mode */}
                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Strength</label>
                                    <input
                                        type="text"
                                        value={editData.strength || ''}
                                        onChange={(e) => updateField('strength', e.target.value || null)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 500mg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Form</label>
                                    <select
                                        value={editData.form || ''}
                                        onChange={(e) => updateField('form', e.target.value || null)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select form</option>
                                        <option value="Tablet">Tablet</option>
                                        <option value="Capsule">Capsule</option>
                                        <option value="Syrup">Syrup</option>
                                        <option value="Injection">Injection</option>
                                        <option value="Ointment">Ointment</option>
                                        <option value="Cream">Cream</option>
                                        <option value="Drops">Drops</option>
                                        <option value="Inhaler">Inhaler</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Route</label>
                                    <select
                                        value={editData.route || ''}
                                        onChange={(e) => updateField('route', e.target.value || null)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select route</option>
                                        <option value="Oral">Oral</option>
                                        <option value="Topical">Topical</option>
                                        <option value="Injection">Injection</option>
                                        <option value="Inhalation">Inhalation</option>
                                        <option value="Eye">Eye</option>
                                        <option value="Ear">Ear</option>
                                        <option value="Nasal">Nasal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Dose</label>
                                    <input
                                        type="text"
                                        value={editData.dose || ''}
                                        onChange={(e) => updateField('dose', e.target.value || null)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 1 tablet"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
                                    <select
                                        value={editData.frequency || ''}
                                        onChange={(e) => updateField('frequency', e.target.value || null)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select frequency</option>
                                        <option value="OD">Once daily (OD)</option>
                                        <option value="BD">Twice daily (BD)</option>
                                        <option value="TDS">Three times daily (TDS)</option>
                                        <option value="QID">Four times daily (QID)</option>
                                        <option value="HS">At bedtime (HS)</option>
                                        <option value="SOS">As needed (SOS)</option>
                                        <option value="PRN">As needed (PRN)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Duration (days)</label>
                                    <input
                                        type="number"
                                        value={editData.duration_days || ''}
                                        onChange={(e) => updateField('duration_days', e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 7"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Food Instruction</label>
                                    <select
                                        value={editData.food_instruction || ''}
                                        onChange={(e) => updateField('food_instruction', e.target.value || null)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">No specific instruction</option>
                                        <option value="Before food">Before food</option>
                                        <option value="After food">After food</option>
                                        <option value="With food">With food</option>
                                        <option value="Empty stomach">On empty stomach</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 inline mr-1" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    <Check className="w-4 h-4 inline mr-1" />
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <DetailItem label="Form" value={medication.form} confidence={medication.confidence.form} />
                                <DetailItem label="Route" value={medication.route} confidence={medication.confidence.route} />
                                <DetailItem label="Dose" value={medication.dose} confidence={medication.confidence.dose} />
                                <DetailItem label="Frequency" value={formatFrequency(medication.frequency)} confidence={medication.confidence.frequency} />
                                <DetailItem
                                    label="Duration"
                                    value={medication.duration_days ? `${medication.duration_days} days` : null}
                                    confidence={medication.confidence.duration_days}
                                />
                                <DetailItem
                                    label="Food"
                                    value={formatFoodInstruction(medication.food_instruction)}
                                    confidence={medication.confidence.food_instruction}
                                />
                            </div>

                            {/* Timing */}
                            {medication.timing && medication.timing.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Timing</p>
                                    <div className="flex flex-wrap gap-2">
                                        {medication.timing.map((time, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs capitalize"
                                            >
                                                {time === 'as_needed' ? 'As needed' : time}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Instructions */}
                            {medication.instructions && medication.instructions.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Instructions</p>
                                    <ul className="space-y-1">
                                        {medication.instructions.map((inst, i) => (
                                            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                <Pill className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                {inst}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Edit button */}
                            {editable && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit details
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

interface DetailItemProps {
    label: string;
    value: string | null | undefined;
    confidence?: number;
}

function DetailItem({ label, value, confidence }: DetailItemProps) {
    return (
        <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <span className="text-gray-900 dark:text-white">
                    {value || <span className="text-gray-400 italic">Not specified</span>}
                </span>
                {confidence !== undefined && value && (
                    <ConfidenceChip confidence={confidence} compact />
                )}
            </div>
        </div>
    );
}
