import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { streamChat, buildSystemPrompt } from '../services/ai';
import { buildRAGContext } from '../services/rag';

const router = Router();

router.get('/test', (_req: Request, res: Response) => {
  res.json({
    keyPresent: !!process.env.OPENAI_API_KEY,
    keyLength: process.env.OPENAI_API_KEY?.length || 0,
    keyPrefix: process.env.OPENAI_API_KEY?.slice(0, 8) || 'none',
    model: process.env.OPENAI_MODEL || 'default',
  });
});

const SUGGESTIONS: Record<string, string[]> = {
  en: [
    'Where should I start?',
    'Best lessons for beginners',
    'Show Tafsir lessons',
    'Recommend Aqeedah teachers',
    'Daily learning plan',
    'Find Hadith lessons',
    'Recommend lessons',
    'Recommend PDFs',
    'Recommend audio',
    'Create study plan',
    'Track my progress',
  ],
  ar: [
    'من أين أبدأ؟',
    'أفضل الدروس للمبتدئين',
    'دروس التفسير',
    'توصية مدرسي العقيدة',
    'خطة تعلم يومية',
    'دروس الحديث',
    'توصية دروس',
    'توصية PDF',
    'توصية صوتيات',
    'إنشاء خطة دراسة',
    'تتبع تقدمي',
  ],
  am: [
    'ከየት መጀመር አለብኝ?',
    'ለጀማሪዎች ምርጥ ትምህርቶች',
    'የተፍሲር ትምህርቶችን አሳይ',
    'የአቅዳ አስተማሪዎችን መክር',
    'ዕለታዊ የትምህርት እቅድ',
    'የሐዲስ ትምህርቶችን ፈልግ',
    'ትምህርቶችን ይምከሩ',
    'PDFs ይምከሩ',
    'ኦዲዮ ይምከሩ',
    'የጥናት ዕቅድ ይፍጠሩ',
    'እድገቴን ይከታተሉ',
  ],
  om: [
    'Eessa irraa eegaluu qaba?',
    'Barattoota jalqabaaaf barumsa gaarii',
    'Barumsa Tafsir agarsiisi',
    'Barsistoota Aqeedah akeekkachiisi',
    'Karoora barumsa guyyaa',
    'Barumsa Hadith barbaadi',
    'Barumsa gorsi',
    'PDF gorsi',
    'Sagalee gorsi',
    'Karoora barumsaa uumi',
    'Fudurrii koo hordofi',
  ],
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 30) {
    return false;
  }
  entry.count++;
  return true;
}

router.post('/chat', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
      return;
    }

    const { message, sessionId, language = 'en', history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ error: 'Message is too long (max 2000 characters)' });
      return;
    }

    const userId = req.userId || null;

    const sanitizedMessage = message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .trim();

    const safeLang = ['en', 'ar', 'am', 'om'].includes(language) ? language : 'en';

    const ragContext = await buildRAGContext(sanitizedMessage);
    const systemPrompt = buildSystemPrompt(safeLang, ragContext);

    const chatHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: sanitizedMessage },
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const session = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    if (userId) {
      prisma.chatMessage.create({
        data: { userId, sessionId: session, role: 'user', content: sanitizedMessage, language: safeLang },
      }).catch(() => {});
    }

    let fullResponse = '';

    await streamChat(chatHistory, safeLang, {
      onChunk: (text: string) => {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
      },
      onDone: () => {
        try {
          if (userId && fullResponse) {
            prisma.chatMessage.create({
              data: { userId, sessionId: session, role: 'assistant', content: fullResponse, language: safeLang },
            }).catch(() => {});
          }
          const suggestions = SUGGESTIONS[safeLang] || SUGGESTIONS.en;
          safeWrite(res, { type: 'suggestions', content: suggestions });
          safeWrite(res, { type: 'sessionId', content: session });
          safeWrite(res, { type: 'done' });
          res.end();
        } catch {}
      },
      onError: (error: Error) => {
        try {
          safeWrite(res, { type: 'error', content: error.message });
          safeWrite(res, { type: 'done' });
          res.end();
        } catch {}
      },
    });
  } catch (error: any) {
    console.error('AI chat route error:', error?.message || error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat message' });
    } else {
      try {
        safeWrite(res, { type: 'error', content: 'An unexpected error occurred' });
        safeWrite(res, { type: 'done' });
        res.end();
      } catch {}
    }
  }
});

function safeWrite(res: Response, data: any) {
  try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {}
}

router.get('/suggestions', (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || 'en';
  const safeLang = ['en', 'ar', 'am', 'om'].includes(lang) ? lang : 'en';
  res.json({ suggestions: SUGGESTIONS[safeLang] || SUGGESTIONS.en });
});

router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { sessionId } = req.query;

    const where: any = { userId };
    if (sessionId) {
      where.sessionId = String(sessionId);
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    const sessions = await prisma.chatMessage.findMany({
      where: { userId, role: 'user' },
      select: { sessionId: true, createdAt: true, content: true },
      orderBy: { createdAt: 'desc' },
      distinct: ['sessionId'],
      take: 20,
    });

    res.json({ messages, sessions });
  } catch {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.delete('/history/:sessionId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { sessionId } = req.params;

    await prisma.chatMessage.deleteMany({
      where: { userId, sessionId },
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete history' });
  }
});

export default router;
