/**
 * Client-side storage utilities for prescription data
 * Uses session storage for privacy (data cleared when browser closes)
 */

import { PrescriptionExtract, NotesOutput } from './schema';

const STORAGE_PREFIX = 'prescriptoai_';

interface StoredPrescription {
    extract: PrescriptionExtract;
    notes?: NotesOutput;
    createdAt: string;
    expiresAt: string;
}

/**
 * Store prescription data in session storage
 */
export function storePrescription(
    prescriptionId: string,
    extract: PrescriptionExtract
): void {
    const retentionHours = 24; // Default retention
    const now = new Date();
    const expiresAt = new Date(now.getTime() + retentionHours * 60 * 60 * 1000);

    const data: StoredPrescription = {
        extract,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
    };

    if (typeof window !== 'undefined') {
        sessionStorage.setItem(
            `${STORAGE_PREFIX}${prescriptionId}`,
            JSON.stringify(data)
        );
    }
}

/**
 * Retrieve prescription data from session storage
 */
export function getPrescription(prescriptionId: string): StoredPrescription | null {
    if (typeof window === 'undefined') return null;

    const stored = sessionStorage.getItem(`${STORAGE_PREFIX}${prescriptionId}`);
    if (!stored) return null;

    try {
        const data: StoredPrescription = JSON.parse(stored);

        // Check expiration
        if (new Date(data.expiresAt) < new Date()) {
            deletePrescription(prescriptionId);
            return null;
        }

        return data;
    } catch {
        return null;
    }
}

/**
 * Update prescription with notes output
 */
export function updatePrescriptionNotes(
    prescriptionId: string,
    notes: NotesOutput
): void {
    const existing = getPrescription(prescriptionId);
    if (existing && typeof window !== 'undefined') {
        existing.notes = notes;
        sessionStorage.setItem(
            `${STORAGE_PREFIX}${prescriptionId}`,
            JSON.stringify(existing)
        );
    }
}

/**
 * Update prescription extract (for user edits)
 */
export function updatePrescriptionExtract(
    prescriptionId: string,
    extract: PrescriptionExtract
): void {
    const existing = getPrescription(prescriptionId);
    if (existing && typeof window !== 'undefined') {
        existing.extract = extract;
        sessionStorage.setItem(
            `${STORAGE_PREFIX}${prescriptionId}`,
            JSON.stringify(existing)
        );
    }
}

/**
 * Delete prescription data (for "Delete now" feature)
 */
export function deletePrescription(prescriptionId: string): void {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`${STORAGE_PREFIX}${prescriptionId}`);
    }
}

/**
 * Delete all prescription data
 */
export function deleteAllPrescriptions(): void {
    if (typeof window === 'undefined') return;

    const keysToDelete: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
            keysToDelete.push(key);
        }
    }
    keysToDelete.forEach(key => sessionStorage.removeItem(key));
}

/**
 * Get current prescription ID from URL or storage
 */
export function getCurrentPrescriptionId(): string | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
