# ImanChercher Ecosystem — Enterprise Architecture Plan

## 1. MONOREPO STRUCTURE (Turborepo)

```
iman-chercher/
├── apps/
│   ├── main-web/          # ImanChercher.com — Central learning hub (Vite→Next.js)
│   ├── saadi/             # Saadi.ImanChercher.com — Tafsir platform
│   ├── kids/              # Kids.ImanChercher.com — Children's platform
│   ├── riyadh/            # Riyadh.ImanChercher.com — Hadith platform
│   ├── iman/              # Iman.ImanChercher.com — Faith & spirituality
│   ├── anees/             # Anees.ImanChercher.com — Community & social
│   ├── qa/                # QA.ImanChercher.com — Questions & Answers
│   └── admin/             # Centralized admin dashboard
├── packages/
│   ├── ui/                # Shared component library (shadcn/ui based)
│   ├── auth/              # Unified authentication (Auth.js)
│   ├── database/          # Prisma schema, migrations, shared client
│   ├── i18n/              # Translation system, locale files, utilities
│   ├── config/            # Shared config (tailwind, tsconfig, eslint)
│   ├── hooks/             # Shared React hooks
│   ├── types/             # Shared TypeScript types
│   ├── api-client/        # API client with type-safe endpoints
│   ├── utils/             # Shared utilities
│   └── media/             # Media handling, uploads, Cloudinary
├── tools/                 # Build/CI scripts
├── docker/                # Docker configs
├── docs/                  # Documentation
├── turbo.json
└── package.json
```

## 2. MIGRATION STRATEGY (Phase-based)

### Phase 1 — Stabilize Current App (NOW)
- Fix translation system — add namespace support, fix missing keys
- Remove ALL hardcoded text across every component
- Create reusable UI component library within existing Vite project
- Standardize design tokens (colors, spacing, typography)
- Fix RTL support in all components
- Optimize performance (code splitting, lazy loading)
- Full audit of all 25+ files with hardcoded text

### Phase 2 — Create Monorepo Foundation
- Initialize Turborepo
- Extract shared packages (ui, auth, database, i18n)
- Migrate current Vite app into apps/main-web
- Set up Prisma with extended schema for subdomain models
- Set up Auth.js with multi-tenant support

### Phase 3 — Build Subdomain Apps
- Scaffold each subdomain app with Next.js 15
- Implement shared design system in packages/ui
- Configure subdomain routing (middleware, DNS)
- Build each subdomain's unique features

### Phase 4 — Enterprise Hardening
- Docker setup
- CI/CD pipeline
- Performance optimization (95+ Lighthouse)
- PWA support
- Security audit
- Load testing

## 3. SUBDOMAIN ROUTING STRATEGY

### DNS Setup
```
*.ImanChercher.com → Vercel (or main server)
  ├── ImanChercher.com        → apps/main-web
  ├── Saadi.ImanChercher.com  → apps/saadi
  ├── Kids.ImanChercher.com   → apps/kids
  ├── Riyadh.ImanChercher.com → apps/riyadh
  ├── Iman.ImanChercher.com   → apps/iman
  ├── Anees.ImanChercher.com  → apps/anees
  └── QA.ImanChercher.com     → apps/qa
```

### Next.js Middleware
Use Next.js middleware to:
- Detect subdomain from host header
- Route to correct app
- Share session cookies across subdomains
- Redirect based on locale detection
- Handle authentication globally

### Shared Auth
Auth.js with JWT strategy:
- Same cookie domain (`.ImanChercher.com`)
- JWT contains: userId, role, allowedSubdomains
- Middleware validates JWT on every subdomain
- Login/logout at main platform, session shared

## 4. SHARED I18N ARCHITECTURE

### Current: TypeScript dot-notation keys
```
en.ts → TranslationDictionary
ar.ts → DeepPartial<TranslationDictionary> with fallback to en
```

### Target: Namespace-based with dynamic loading
```
locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── home.json
│   ├── saadi.json
│   ├── kids.json
│   └── admin.json
├── ar/
├── am/
└── om/
```

### Key Improvements Needed
1. Add interpolation support (`t('key', { name: 'John' })`)
2. Add pluralization support
3. Add namespace-based lazy loading
4. Fix LanguageContext to persist correctly
5. Ensure RTL class toggling works on all pages

## 5. DATABASE ARCHITECTURE (PostgreSQL + Prisma)

### Extended Schema for Ecosystem (additions to existing)

```
// New models for ecosystem
model TafsirWork {
  id            Int      @id @default(autoincrement())
  title         String
  titleArabic   String?
  scholarId     Int?
  language      String   @default("en")
  verses        TafsirVerse[]
  scholar       Scholar? @relation(fields: [scholarId], references: [id])
}

model TafsirVerse {
  id            Int      @id @default(autoincrement())
  surahNumber   Int
  verseNumber   Int
  tafsirWorkId  Int
  explanation   String
  explanationArabic String?
  audioUrl      String?
  tafsirWork    TafsirWork @relation(fields: [tafsirWorkId], references: [id])
}

model Hadith {
  id            Int      @id @default(autoincrement())
  book          String
  chapter       String?
  arabic        String
  translation   String
  explanation   String?
  narrator      String?
  source        String
  grade         String?
  tags          String?
  audioUrl      String?
}

model Question {
  id            Int      @id @default(autoincrement())
  title         String
  body          String
  userId        Int
  category      String?
  isAnonymous   Boolean  @default(false)
  isAnswered    Boolean  @default(false)
  votes         Int      @default(0)
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
  answers       Answer[]
}

model Answer {
  id            Int      @id @default(autoincrement())
  questionId    Int
  userId        Int      @default(0)
  body          String
  isVerified    Boolean  @default(false)
  votes         Int      @default(0)
  createdAt     DateTime @default(now())
  question      Question @relation(fields: [questionId], references: [id])
  user          User     @relation(fields: [userId], references: [id])
}

model Community {
  id            Int      @id @default(autoincrement())
  name          String
  slug          String   @unique
  description   String?
  image         String?
  memberCount   Int      @default(0)
  createdAt     DateTime @default(now())
  members       CommunityMember[]
}

model CommunityMember {
  id            Int      @id @default(autoincrement())
  communityId   Int
  userId        Int
  role          String   @default("member")
  joinedAt      DateTime @default(now())
  community     Community @relation(fields: [communityId], references: [id])
  user          User     @relation(fields: [userId], references: [id])
}

// Add Scholar role & profile
model Scholar {
  id            Int      @id @default(autoincrement())
  userId        Int      @unique
  bio           String?
  credentials   String?
  isVerified    Boolean  @default(false)
  specialties   String?
  user          User     @relation(fields: [userId], references: [id])
}

// Add Certificate
model Certificate {
  id            Int      @id @default(autoincrement())
  userId        Int
  courseId      Int?
  issuedAt      DateTime @default(now())
  certificateUrl String?
  user          User     @relation(fields: [userId], references: [id])
}

// Add Child profiles (for Kids platform)
model ChildProfile {
  id            Int      @id @default(autoincrement())
  parentId      Int
  name          String
  age           Int?
  avatar        String?
  parent        User     @relation(fields: [parentId], references: [id])
  progress      ChildProgress[]
}

model ChildProgress {
  id            Int      @id @default(autoincrement())
  childId       Int
  activityType  String
  activityId    Int
  completed     Boolean  @default(false)
  score         Int?
  child         ChildProfile @relation(fields: [childId], references: [id])
}
```

## 6. UI COMPONENT SYSTEM

### Shared Components (packages/ui)
```
ui/
├── src/
│   ├── button/
│   │   ├── Button.tsx
│   │   ├── Button.variants.ts
│   │   └── index.ts
│   ├── card/
│   ├── dialog/
│   ├── input/
│   ├── select/
│   ├── badge/
│   ├── typography/
│   ├── layout/
│   ├── islamic/
│   │   ├── GeometricPattern.tsx
│   │   ├── Bismillah.tsx
│   │   ├── VerseBanner.tsx
│   │   └── MosqueIcon.tsx
│   ├── navigation/
│   └── feedback/
├── tokens/
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── animations.ts
└── index.ts
```

### Design Tokens
- Primary: ICC green (#10B981)
- Gold: (#F59E0B)
- Dark background: (#0F172A)
- Surface: (#1E293B)
- RTL-aware spacing utilities
- Islamic geometric patterns as SVG backgrounds

## 7. IMPLEMENTATION ROADMAP

### Phase 1 (Week 1-2): Current App Stabilization
- [ ] Fix translation system (interpolation, namespaces, persistence)
- [ ] Remove hardcoded text from ALL 25+ files
- [ ] Create reusable UI components in src/components/ui/
- [ ] Fix RTL support site-wide
- [ ] Standardize CSS variables for design tokens
- [ ] Optimize build (code splitting admin, heavy sections)
- [ ] Full TypeScript strict mode compliance

### Phase 2 (Week 3-4): Monorepo Foundation
- [ ] Initialize Turborepo
- [ ] Extract packages/ui with shadcn/ui
- [ ] Extract packages/i18n with next-intl
- [ ] Extract packages/database with Prisma
- [ ] Extract packages/auth with Auth.js
- [ ] Migrate Vite app into apps/main-web
- [ ] Set up Next.js 15 for apps/main-web

### Phase 3 (Week 5-8): Subdomain Apps
- [ ] apps/saadi — Tafsir platform (Quran reader, tafsir search)
- [ ] apps/kids — Kids platform (gamified learning)
- [ ] apps/riyadh — Hadith platform
- [ ] apps/iman — Faith & spirituality
- [ ] apps/anees — Community platform
- [ ] apps/qa — Q&A platform

### Phase 4 (Week 9-10): Enterprise Features
- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] PWA support
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Load testing

## 8. IMMEDIATE NEXT STEPS

### Priority: Fix Translation System
1. Add `t(key, params)` interpolation support
2. Move locale files to namespace structure
3. Ensure LanguageContext persists to localStorage
4. Fix RTL class attachment to `<html>` element

### Priority: Remove Hardcoded Text
Remaining files with hardcoded text (audit):
- AI components (AIChatPanel, ChatMessage, AIDashboardWidget, etc.)
- AudioPlayer
- PrayerTimesWidget
- LessonDetail, TeacherDetail, CategoryDetail, BookDetail, LevelPage
- Footer language list
- Admin CRUD pages (6 files)

### Priority: Create UI Component Library
- Button, Card, Badge, Input/Textarea, Select, Dialog/Modal
- SectionHeader, LoadingSpinner, EmptyState
- Islamic decorative components
