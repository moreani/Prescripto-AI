// Medical abbreviation expansions for prescriptions
// Based on common prescription abbreviations used in medical practice

export const FREQUENCY_ABBREVIATIONS: Record<string, string> = {
    // Frequency
    'OD': 'Once daily',
    'QD': 'Once daily',
    'BD': 'Twice daily',
    'BID': 'Twice daily',
    'TDS': 'Three times daily',
    'TID': 'Three times daily',
    'QID': 'Four times daily',
    'QDS': 'Four times daily',
    'Q4H': 'Every 4 hours',
    'Q6H': 'Every 6 hours',
    'Q8H': 'Every 8 hours',
    'Q12H': 'Every 12 hours',
    'HS': 'At bedtime',
    'QHS': 'Every night at bedtime',
    'PRN': 'As needed',
    'SOS': 'As needed (if necessary)',
    'STAT': 'Immediately',
    'QOD': 'Every other day',
    'QWK': 'Once weekly',
    'BIW': 'Twice weekly',
};

export const TIMING_ABBREVIATIONS: Record<string, string> = {
    // Timing related to meals
    'AC': 'Before meals',
    'PC': 'After meals',
    'CC': 'With meals',
    'HS': 'At bedtime',
    'AM': 'In the morning',
    'PM': 'In the evening',
    'MANE': 'In the morning',
    'NOCTE': 'At night',
};

export const ROUTE_ABBREVIATIONS: Record<string, string> = {
    // Route of administration
    'PO': 'By mouth (oral)',
    'SL': 'Under the tongue (sublingual)',
    'PR': 'Rectally',
    'IM': 'Intramuscular injection',
    'IV': 'Intravenous',
    'SC': 'Subcutaneous injection',
    'ID': 'Intradermal',
    'TOP': 'Topical (on skin)',
    'INH': 'Inhalation',
    'NEB': 'Nebulizer',
    'OPH': 'Ophthalmic (eye)',
    'OT': 'Otic (ear)',
    'NAS': 'Nasal',
};

export const FORM_ABBREVIATIONS: Record<string, string> = {
    // Dosage forms
    'TAB': 'Tablet',
    'CAP': 'Capsule',
    'SYR': 'Syrup',
    'SUSP': 'Suspension',
    'SOL': 'Solution',
    'INJ': 'Injection',
    'CR': 'Controlled release',
    'SR': 'Sustained release',
    'XR': 'Extended release',
    'ER': 'Extended release',
    'DR': 'Delayed release',
    'SUPP': 'Suppository',
    'OINT': 'Ointment',
    'CRM': 'Cream',
    'LOT': 'Lotion',
    'GEL': 'Gel',
    'DROP': 'Drops',
    'GTT': 'Drops',
};

export const ALL_ABBREVIATIONS: Record<string, string> = {
    ...FREQUENCY_ABBREVIATIONS,
    ...TIMING_ABBREVIATIONS,
    ...ROUTE_ABBREVIATIONS,
    ...FORM_ABBREVIATIONS,
};

/**
 * Expand a single abbreviation to its full form
 */
export function expandAbbreviation(abbr: string): string {
    const upper = abbr.toUpperCase().trim();
    return ALL_ABBREVIATIONS[upper] || abbr;
}

/**
 * Expand all abbreviations in a text string
 */
export function expandAllAbbreviations(text: string): string {
    if (!text) return text;

    let result = text;

    // Sort by length descending to match longer abbreviations first
    const sortedAbbrs = Object.keys(ALL_ABBREVIATIONS).sort((a, b) => b.length - a.length);

    for (const abbr of sortedAbbrs) {
        // Match whole words only (case-insensitive)
        const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
        result = result.replace(regex, ALL_ABBREVIATIONS[abbr]);
    }

    return result;
}

/**
 * Get timing slots from frequency abbreviation
 */
export function getTimingFromFrequency(frequency: string): string[] {
    const upper = frequency?.toUpperCase().trim() || '';

    switch (upper) {
        case 'OD':
        case 'QD':
            return ['morning'];
        case 'BD':
        case 'BID':
            return ['morning', 'night'];
        case 'TDS':
        case 'TID':
            return ['morning', 'afternoon', 'night'];
        case 'QID':
        case 'QDS':
            return ['morning', 'afternoon', 'evening', 'night'];
        case 'HS':
        case 'QHS':
        case 'NOCTE':
            return ['night'];
        case 'MANE':
        case 'AM':
            return ['morning'];
        case 'PRN':
        case 'SOS':
            return ['as_needed'];
        default:
            return ['morning']; // Default to morning if unclear
    }
}

/**
 * Format frequency for display
 */
export function formatFrequency(frequency: string | null): string {
    if (!frequency) return 'Not specified';

    const expanded = expandAbbreviation(frequency);
    if (expanded !== frequency) {
        return `${expanded} (${frequency})`;
    }
    return frequency;
}

/**
 * Format food instruction for display
 */
export function formatFoodInstruction(instruction: string | null): string {
    if (!instruction) return 'No specific instructions';

    const expanded = expandAllAbbreviations(instruction);
    return expanded.charAt(0).toUpperCase() + expanded.slice(1);
}
