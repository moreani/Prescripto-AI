'use client';

import React from 'react';
import { Sun, CloudSun, Sunset, Moon, Clock } from 'lucide-react';

interface ScheduleItem {
    name: string;
    dose: string | null;
    instructions: string | null;
}

interface Schedule {
    morning: ScheduleItem[];
    afternoon: ScheduleItem[];
    evening: ScheduleItem[];
    night: ScheduleItem[];
    as_needed: ScheduleItem[];
}

interface ScheduleTableProps {
    schedule: Schedule;
}

export function ScheduleTable({ schedule }: ScheduleTableProps) {
    const timeSlots = [
        { key: 'morning' as const, label: 'Morning', icon: Sun, color: 'from-amber-400 to-orange-400', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
        { key: 'afternoon' as const, label: 'Afternoon', icon: CloudSun, color: 'from-sky-400 to-blue-400', bgColor: 'bg-sky-50 dark:bg-sky-950/30' },
        { key: 'evening' as const, label: 'Evening', icon: Sunset, color: 'from-orange-400 to-rose-400', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
        { key: 'night' as const, label: 'Night', icon: Moon, color: 'from-indigo-400 to-purple-400', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30' },
        { key: 'as_needed' as const, label: 'As Needed', icon: Clock, color: 'from-gray-400 to-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-800/50' },
    ];

    const hasAnyMedications = Object.values(schedule).some(meds => meds.length > 0);

    if (!hasAnyMedications) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No medications scheduled</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {timeSlots.map(({ key, label, icon: Icon, color, bgColor }) => {
                const meds = schedule[key];
                if (meds.length === 0) return null;

                return (
                    <div key={key} className={`rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700`}>
                        {/* Time slot header */}
                        <div className={`bg-gradient-to-r ${color} px-4 py-3 flex items-center gap-3`}>
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{label}</h3>
                                <p className="text-xs text-white/80">{meds.length} medication{meds.length > 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        {/* Medications list */}
                        <div className={`${bgColor} divide-y divide-gray-200/50 dark:divide-gray-700/50`}>
                            {meds.map((med, index) => (
                                <div key={index} className="px-4 py-3 flex items-start gap-3">
                                    <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{med.name}</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {med.dose && (
                                                <span className="inline-flex items-center px-2 py-0.5 bg-white dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                                                    {med.dose}
                                                </span>
                                            )}
                                            {med.instructions && (
                                                <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-xs text-blue-700 dark:text-blue-300">
                                                    {med.instructions}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Compact table view for print/PDF
export function ScheduleTableCompact({ schedule }: ScheduleTableProps) {
    const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night', 'As Needed'] as const;
    const scheduleKeys = ['morning', 'afternoon', 'evening', 'night', 'as_needed'] as const;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                        {timeSlots.map(slot => (
                            <th key={slot} className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                {slot}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {scheduleKeys.map(key => (
                            <td key={key} className="px-3 py-2 align-top border-b border-gray-200 dark:border-gray-700">
                                {schedule[key].length > 0 ? (
                                    <ul className="space-y-1">
                                        {schedule[key].map((med, i) => (
                                            <li key={i} className="text-gray-700 dark:text-gray-300">
                                                • {med.name}
                                                {med.dose && <span className="text-gray-500"> ({med.dose})</span>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
