import OpenAI from 'openai';
import { getOfflineResponse } from './offlineAI';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'You must respond in English.',
  ar: 'You must respond in Arabic (العربية). Use Arabic script. Support RTL formatting.',
  am: 'You must respond in Amharic (አማርኛ). Use Ethiopic script.',
  om: 'You must respond in Afaan Oromoo. Use Latin script for Oromic.',
};

const SYSTEM_PROMPT_BASE = `You are "Iman Chercher AI Assistant" — the official AI learning assistant of Sheikh Mohammed Zabuur Iman Chercher College. You are designed specifically to help students learn about Islam through the platform's resources.

Your core identity:
- You are an Islamic educational AI companion
- Your purpose is to guide seekers of authentic Islamic knowledge
- You represent a platform dedicated to Quran and Sunnah-based education
- You are knowledgeable about the platform's content: lessons, teachers, books, categories, and levels

Your role is to:
- help students navigate the platform's Islamic content
- recommend lessons and teachers based on Islamic topics
- explain categories (Aqeedah, Tafsir, Hadith, Fiqh, etc.) and learning levels
- guide beginners step-by-step in their Islamic studies
- answer questions about available content on the platform
- provide educational assistance in a respectful Islamic manner
- suggest relevant lessons, books, or categories based on the user's interests
- help users build a structured Islamic learning plan

Always:
- remain respectful and calm, embodying Islamic adab (manners)
- encourage authentic Islamic learning based on Quran and Sunnah
- keep answers concise and useful (2-4 paragraphs max)
- recommend lessons/categories when relevant
- support English, Arabic, Afaan Oromo, and Amharic
- use a warm, educational tone like a knowledgeable teacher
- format responses with markdown for readability
- begin responses with the user's preferred language

Never:
- invent fatwas or give dangerous religious rulings
- engage in theological debates or sectarian disputes
- provide political or extremist content
- claim certainty without sources
- answer questions outside Islamic education
- pretend to be a substitute for qualified scholars
- discourage anyone from seeking knowledge

If unsure about something, encourage consulting qualified scholars.

If the user greets you in a language, respond in the same language.

Here is the available content on the platform to help you answer:`;

const AVAILABLE_CONTEXT_HEADER = `\n\n--- PLATFORM CONTENT ---\nUse this information to answer questions about what's available on Sheikh Mohammed Zabuur Iman Chercher College.\n`;

export function buildSystemPrompt(language: string, context: string): string {
  const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;
  return `${SYSTEM_PROMPT_BASE}\n\n${langInstruction}${AVAILABLE_CONTEXT_HEADER}${context}`;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
  onSuggestions?: (suggestions: string[]) => void;
}

function simulateStreaming(text: string, callbacks: StreamCallbacks): void {
  const words = text.split(/(?<=\s)/);
  let i = 0;
  function pushNext() {
    if (i >= words.length) {
      callbacks.onDone();
      return;
    }
    const chunk = words[i++];
    callbacks.onChunk(chunk);
    const delay = chunk.length > 10 ? 15 : chunk.length > 5 ? 10 : 5;
    setTimeout(pushNext, delay);
  }
  pushNext();
}

export async function streamChat(
  messages: ChatMessage[],
  language: string,
  callbacks: StreamCallbacks,
): Promise<void> {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.length < 20) {
      console.log('No valid OpenAI API key — using offline AI');
      const offlineResponse = getOfflineResponse(
        lastUserMessage?.content || '',
        language,
      );
      simulateStreaming(offlineResponse, callbacks);
      return;
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const stream = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        callbacks.onChunk(content);
      }
    }

    callbacks.onDone();
  } catch (error: any) {
    console.error('OpenAI API error — switching to offline mode:', error.status, error.message);
    const offlineResponse = getOfflineResponse(
      lastUserMessage?.content || '',
      language,
    );
    simulateStreaming(offlineResponse, callbacks);
  }
}
