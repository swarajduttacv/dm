// FIX: The original `export type { Chat } from ...` only re-exported the type without making it available in this file. This is changed to an import and then a separate export to resolve the `Cannot find name 'Chat'` error.
import type { Chat } from "@google/genai";
export type { Chat };

export interface Document {
  id: string;
  fileName: string;
  extractedText: string;
  uploadDate: string;
  type: 'file' | 'note';
}

export interface FormFieldResult {
  fieldName: string;
  suggestedValue: string;
  sourceDocument: string;
}

export interface FormAnalysis {
  id: string;
  formFileName: string;
  analysisDate: string;
  results: FormFieldResult[];
}

export interface User {
  username: string;
  documents: Document[];
  formAnalyses: FormAnalysis[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  image?: string;
}

export interface ChatSession {
  // FIX: Allow `chat` to be `null` to correctly represent its initial state in the application.
  chat: Chat | null;
  isInitialized: boolean;
}