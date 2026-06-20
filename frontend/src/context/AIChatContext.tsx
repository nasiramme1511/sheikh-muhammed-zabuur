// Context + Hook only — safe for React Fast Refresh
import { createContext, useContext } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AIChatContextType {
  isOpen: boolean;
  isStreaming: boolean;
  messages: ChatMessage[];
  currentSessionId: string | null;
  suggestions: string[];
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  regenerate: () => Promise<void>;
  clearChat: () => void;
}

export const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function useAIChat(): AIChatContextType {
  const ctx = useContext(AIChatContext);
  if (!ctx) throw new Error('useAIChat must be used within AIChatProvider');
  return ctx;
}

export const STORAGE_KEY = 'icc-ai-messages';
export const SESSION_KEY = 'icc-ai-session';

export function loadMessages(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  } catch {}
}

export const QUICK_SUGGESTIONS: Record<string, string[]> = {
  en: [
    'Where should I start?',
    'Best lessons for beginners',
    'Show Tafsir lessons',
    'About Riyadus Salihin',
    'About Bulugh al-Maram',
    'About Tawheed',
    'Explain a hadith',
  ],
  ar: [
    'من أين أبدأ؟',
    'أفضل الدروس للمبتدئين',
    'دروس التفسير',
    'عن رياض الصالحين',
    'عن بلوغ المرام',
    'عن التوحيد',
    'شرح حديث',
  ],
  am: [
    'ከየት መጀመር አለብኝ?',
    'ለጀማሪዎች ምርጥ ትምህርቶች',
    'የተፍሲር ትምህርቶችን አሳይ',
    'ስለ ሪያዱስ ሳሊሂን',
    'ሐዲስ አስረዳ',
  ],
  om: [
    'Eessa irraa eegaluu qaba?',
    'Barattoota jalqabaaaf barumsa gaarii',
    'Barumsa Tafsir agarsiisi',
    "Waa'ee Riyadus Salihin",
    'Hadith ibsi',
  ],
};
