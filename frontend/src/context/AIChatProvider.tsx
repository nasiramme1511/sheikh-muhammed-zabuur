// Provider component only — imports from AIChatContext.ts
import { useState, useCallback, useRef, type ReactNode } from 'react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import LoginWallModal from '../components/LoginWallModal';
import { AIChatContext, STORAGE_KEY, SESSION_KEY, loadMessages, saveMessages } from './AIChatContext';
import type { ChatMessage } from './AIChatContext';

export function AIChatProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const [showLoginWall, setShowLoginWall] = useState(false);

  const toggleChat = useCallback(() => {
    if (!user) { setShowLoginWall(true); return; }
    setIsOpen((v) => !v);
  }, [user]);
  const openChat = useCallback(() => {
    if (!user) { setShowLoginWall(true); return; }
    setIsOpen(true);
  }, [user]);
  const closeChat = useCallback(() => setIsOpen(false), []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const safeLang = ['en', 'ar', 'am', 'om'].includes(language) ? language : 'en';

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setIsStreaming(true);
    setSuggestions([]);

    const history = updatedMessages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: content.trim(),
          sessionId: currentSessionId,
          language: safeLang,
          history: history.slice(0, -1),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      const assistantId = `msg_${Date.now()}_ai`;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'text') {
              assistantContent += data.content;
              setMessages((prev) => {
                const existing = prev.find((m) => m.id === assistantId);
                if (existing) {
                  return prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  );
                }
                const newMsg: ChatMessage = {
                  id: assistantId,
                  role: 'assistant',
                  content: assistantContent,
                  timestamp: Date.now(),
                };
                return [...prev, newMsg];
              });
            } else if (data.type === 'suggestions') {
              setSuggestions(data.content || []);
            } else if (data.type === 'sessionId') {
              setCurrentSessionId(data.content);
              try { localStorage.setItem(SESSION_KEY, data.content); } catch {}
            } else if (data.type === 'error') {
              throw new Error(data.content);
            }
          } catch {}
        }
      }

      const finalMessages = [...updatedMessages];
      if (assistantContent) {
        finalMessages.push({
          id: assistantId,
          role: 'assistant',
          content: assistantContent,
          timestamp: Date.now(),
        });
      }
      saveMessages(finalMessages);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: error.message?.includes('quota') || error.message?.includes('429')
          ? 'The AI assistant is currently unavailable due to high demand. Please try again later or contact the administrator to renew the AI service.'
          : `⚠️ ${error.message || 'Sorry, I encountered an error. Please try again.'}`,
        timestamp: Date.now(),
      };
      const withError = [...updatedMessages, errorMsg];
      setMessages(withError);
      saveMessages(withError);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, isStreaming, language, currentSessionId]);

  const regenerate = useCallback(async () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      const withoutLast = messages.filter(
        (m) => m.id !== messages[messages.length - 1]?.id || m.role === 'user'
      );
      setMessages(withoutLast);
      saveMessages(withoutLast);
      await sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
    setCurrentSessionId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  }, []);

  return (
    <AIChatContext.Provider
      value={{
        isOpen,
        isStreaming,
        messages,
        currentSessionId,
        suggestions,
        toggleChat,
        openChat,
        closeChat,
        sendMessage,
        regenerate,
        clearChat,
      }}
    >
      <LoginWallModal isOpen={showLoginWall} onClose={() => setShowLoginWall(false)} />
      {children}
    </AIChatContext.Provider>
  );
}
