import { z } from 'zod';

// Medication schema matching PRD requirements
export const MedicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  strength: z.string().nullable(),
  form: z.string().nullable(), // tablet, capsule, syrup, etc.
  route: z.string().nullable(), // oral, topical, etc.
  dose: z.string().nullable(), // e.g., "1", "2", "5ml"
  frequency: z.string().nullable(), // OD, BD, TDS, QID, etc.
  timing: z.array(z.string()).nullable(), // ["morning", "night"]
  duration_days: z.number().nullable(),
  food_instruction: z.string().nullable(), // "before food", "after food", etc.
  instructions: z.array(z.string()).nullable(), // additional instructions
  confidence: z.record(z.string(), z.number()), // field-level confidence scores
  needs_confirmation: z.array(z.string()), // fields that need user confirmation
});

export type Medication = z.infer<typeof MedicationSchema>;

// Full prescription extract schema
export const PrescriptionExtractSchema = z.object({
  prescription_id: z.string(),
  source_type: z.enum(["image", "pdf"]),
  ocr_text: z.string(),
  medications: z.array(MedicationSchema),
  follow_up: z.string().nullable(),
  tests: z.array(z.string()).nullable(),
});

export type PrescriptionExtract = z.infer<typeof PrescriptionExtractSchema>;

// OCR result schema
export const OCRResultSchema = z.object({
  prescription_id: z.string(),
  ocr_text: z.string(),
  source_type: z.enum(["image", "pdf"]),
  pages_count: z.number(),
});

export type OCRResult = z.infer<typeof OCRResultSchema>;

// Notes output schema
export const NotesOutputSchema = z.object({
  prescription_id: z.string(),
  notes_markdown: z.string(),
  schedule: z.object({
    morning: z.array(z.object({
      name: z.string(),
      dose: z.string().nullable(),
      instructions: z.string().nullable(),
    })),
    afternoon: z.array(z.object({
      name: z.string(),
      dose: z.string().nullable(),
      instructions: z.string().nullable(),
    })),
    evening: z.array(z.object({
      name: z.string(),
      dose: z.string().nullable(),
      instructions: z.string().nullable(),
    })),
    night: z.array(z.object({
      name: z.string(),
      dose: z.string().nullable(),
      instructions: z.string().nullable(),
    })),
    as_needed: z.array(z.object({
      name: z.string(),
      dose: z.string().nullable(),
      instructions: z.string().nullable(),
    })),
  }),
  meds_display: z.array(MedicationSchema),
});

export type NotesOutput = z.infer<typeof NotesOutputSchema>;

// Feedback schema
export const FeedbackSchema = z.object({
  prescription_id: z.string(),
  helpful: z.boolean().nullable(),
  issue_type: z.string().nullable(),
  comment: z.string().nullable(),
  timestamp: z.string(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

// Validation helpers
export function validateMedication(data: unknown): Medication {
  return MedicationSchema.parse(data);
}

export function validatePrescriptionExtract(data: unknown): PrescriptionExtract {
  return PrescriptionExtractSchema.parse(data);
}

export function validateNotesOutput(data: unknown): NotesOutput {
  return NotesOutputSchema.parse(data);
}
