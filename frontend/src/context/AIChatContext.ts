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
    'Explain Tafsir verses',
    'About Riyadus Salihin',
    'About Bulugh al-Maram',
    'About Tawheed',
    'About Usul',
    'About Tajreed',
    'Explain a hadith',
    "What is Al-Arba'in?",
    'About Al-Bayquniyyah',
  ],
  ar: [
    'من أين أبدأ؟',
    'أفضل الدروس للمبتدئين',
    'دروس التفسير',
    'شرح آيات التفسير',
    'عن رياض الصالحين',
    'عن بلوغ المرام',
    'عن التوحيد',
    'عن الأصول',
    'عن التجريد',
    'شرح حديث',
    'ما هي الأربعون؟',
    'عن البيقونية',
  ],
  am: [
    'ከየት መጀመር አለብኝ?',
    'ለጀማሪዎች ምርጥ ትምህርቶች',
    'የተፍሲር ትምህርቶችን አሳይ',
    'የተፍሲር ጥቅሶችን አስረዳ',
    'ስለ ሪያዱስ ሳሊሂን',
    'ስለ ቡሉግ አል-ማራም',
    'ስለ ታውሂድ',
    'ስለ ኡሱል',
    'ስለ ታጅሪድ',
    'ሐዲስ አስረዳ',
    'አል-አርባኢን ምንድን ነው?',
    'ስለ አል-ባይቁኒያህ',
  ],
  om: [
    'Eessa irraa eegaluu qaba?',
    'Barattoota jalqabaaaf barumsa gaarii',
    'Barumsa Tafsir agarsiisi',
    "Keewwata Tafsir ibsi",
    "Waa'ee Riyadus Salihin",
    "Waa'ee Bulugh al-Maram",
    "Waa'ee Tawheed",
    "Waa'ee Usul",
    "Waa'ee Tajreed",
    'Hadith ibsi',
    "Al-Arba'in maal?",
    "Waa'ee Al-Bayquniyyah",
  ],
};
