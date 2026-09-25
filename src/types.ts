export type TranscriptionMode = 
  | 'vaishnava_english'      // Vaishnava/Vedic context: English lecturer only, eliminates mishearings, filters interpreter
  | 'bilingual_split'        // Both speakers: [Lecturer (EN)] + [Interpreter (Detected Language)]
  | 'vaishnava_with_summary' // English verbatim + Philosophical study notes & quoted shlokas
  | 'general_english'        // General non-philosophical lecture (English only)
  | 'custom';                // Custom prompt

export interface ModeConfig {
  id: TranscriptionMode;
  name: string;
  badge: string;
  description: string;
  prompt: string;
  customScripture?: string;
}

export type ProcessingStage = 
  | 'idle'
  | 'uploading'
  | 'processing_audio'
  | 'transcribing'
  | 'translating'
  | 'completed'
  | 'error';

export interface ProgressState {
  stage: ProcessingStage;
  percent: number; // 0 - 100 for upload
  message: string;
  bytesUploaded?: number;
  totalBytes?: number;
  elapsedSeconds?: number;
}

export type ViewerTab = 'english' | 'russian' | 'bilingual';

export type InputSourceMode = 'audio' | 'text';
