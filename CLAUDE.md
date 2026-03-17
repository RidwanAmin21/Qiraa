# CLAUDE.md — Qiraa: Quran Recitation Style Training App

> **Read this entire document before writing any code.** This is the single source of truth for the Qiraa project. Every architectural decision, design token, file path, API contract, and coding standard lives here.

---

## TABLE OF CONTENTS

1. [Project Vision](#1-project-vision)
2. [Product Overview](#2-product-overview)
3. [Tech Stack](#3-tech-stack)
4. [Monorepo Structure](#4-monorepo-structure)
5. [Design System & UI/UX](#5-design-system--uiux)
6. [Mobile App (Expo/React Native)](#6-mobile-app-exporeact-native)
7. [ML Backend (Python/FastAPI)](#7-ml-backend-pythonfastapi)
8. [Database Schema (Supabase)](#8-database-schema-supabase)
9. [API Contracts](#9-api-contracts)
10. [Audio Pipeline](#10-audio-pipeline)
11. [Scoring Engine](#11-scoring-engine)
12. [Reference Audio Data](#12-reference-audio-data)
13. [Authentication & Authorization](#13-authentication--authorization)
14. [Screen Specifications](#14-screen-specifications)
15. [State Management](#15-state-management)
16. [Mobile Architecture Patterns](#16-mobile-architecture-patterns)
17. [Error Handling](#17-error-handling)
18. [Performance Targets](#18-performance-targets)
19. [Testing Strategy](#19-testing-strategy)
20. [Deployment & CI/CD](#20-deployment--cicd)
21. [Coding Standards](#21-coding-standards)
22. [Phase 1 Scope Boundaries](#22-phase-1-scope-boundaries)
23. [Common Pitfalls](#23-common-pitfalls)

---

## 1. PROJECT VISION

Qiraa is a mobile app that helps Muslims improve their Quran recitation by learning from and imitating the styles of renowned reciters. Users record themselves reciting a verse, and the app analyzes their melody, rhythm, pacing, and word accuracy against a reference reciter — then provides a similarity score with visual feedback showing exactly where they diverged.

**The one-line pitch:** "Practice Quran recitation alongside your favorite reciters and see exactly how to sound more like them."

**Core interaction loop (this is the entire product):**
1. User selects a surah → ayah → reciter
2. User listens to the reference reciter's audio
3. User records their own recitation
4. App uploads recording → ML backend analyzes it (~5-8 seconds)
5. App displays similarity score + pitch overlay + per-dimension breakdown
6. User retries or advances to next ayah

**If this loop doesn't feel magical, nothing else matters.** Every technical decision serves this loop.

### Guiding Principles
- **Reverence first.** This is the Quran. Every screen, animation, and word of copy treats the content with dignity. No gamification gimmicks. Calm, beautiful, respectful.
- **Encouragement, not judgment.** Scores show progress, never punish. Every result includes something positive and one actionable suggestion.
- **Supplement, don't replace.** We are a practice tool, not a substitute for a human teacher. We say this explicitly in onboarding.
- **Arabic-first.** RTL is the primary layout, not a localization pass. Arabic text rendering must be flawless with full tashkeel (diacritics).

---

## 2. PRODUCT OVERVIEW

### Phase 1 Scope
- **5 reciters:** Mishary Al-Afasy, Abdul Rahman Al-Sudais, Mahmoud Khalil Al-Husary, Abdul Basit Abdul Samad, Maher Al-Muaiqly
- **10 surahs:** Al-Kawthar (108), Al-Ikhlas (112), Al-Falaq (113), An-Nas (114), Al-Fatiha (1), Ayat al-Kursi (2:255), Ar-Rahman (55), Al-Mulk (67), Yasin (36), Al-Kahf (18)
- **12 screens:** Onboarding (3), Home Dashboard, Surah Browser, Ayah List, Recitation Studio, Analysis Loading, Results, Progress/Stats, Reciter Profile, Settings

### Explicitly NOT in Phase 1
- Tajweed rule detection (Phase 2)
- Offline mode (Phase 2)
- Social features / leaderboards (Phase 2)
- More than 10 surahs or 5 reciters
- Tablet-specific layouts
- Multi-language UI (English only)
- Monetization / subscriptions

---

## 3. TECH STACK

### Mobile App
| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.76+ | Mobile framework |
| Expo | SDK 52+ | Build tooling, native API access |
| Expo Router | v4+ | File-based navigation |
| expo-av | Latest | Audio recording (16kHz mono) and playback |
| TypeScript | 5.x | Type safety |
| Zustand | 5.x | Global state management |
| React Native Reanimated | 3.x | 60fps animations (record button pulse, score reveals) |
| react-native-skia | Latest | Custom graphics (pitch contour overlay) |
| @supabase/supabase-js | 2.x | Auth, database, storage client |
| expo-notifications | Latest | Push notifications |
| expo-haptics | Latest | Haptic feedback on key interactions |
| date-fns | Latest | Date formatting for streaks/progress |

### ML Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | 0.110+ | API framework |
| faster-whisper | Latest | Arabic ASR (speech-to-text) with word timestamps |
| librosa | 0.10+ | Audio feature extraction (pitch, energy, spectral) |
| noisereduce | Latest | Spectral gating for background noise removal |
| dtw-python | Latest | Dynamic Time Warping for contour comparison |
| numpy / scipy | Latest | Numerical computation |
| Celery | 5.x | Async task queue for audio processing |
| Redis | 7.x | Task broker + feature vector cache |
| Docker | Latest | Containerization |
| Gunicorn + Uvicorn | Latest | Production ASGI server |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase | PostgreSQL database, Auth (email + Google + Apple), file storage, Edge Functions |
| AWS S3 + CloudFront | Reference audio CDN, pre-computed feature vectors |
| Railway or EC2 (g4dn.xlarge) | ML backend with GPU (T4) |
| Upstash Redis | Managed Redis for Celery broker + caching |
| Vercel | Marketing site (Next.js) |
| Expo EAS | Cloud builds for iOS + Android |
| PostHog | Privacy-friendly analytics |
| Sentry | Error tracking (both mobile + backend) |

---

## 4. MONOREPO STRUCTURE

```
qiraa/
├── apps/
│   ├── mobile/                    # Expo/React Native app
│   │   ├── app/                   # Expo Router file-based routes
│   │   │   ├── (auth)/            # Auth group (login, signup)
│   │   │   │   ├── login.tsx
│   │   │   │   └── signup.tsx
│   │   │   ├── (tabs)/            # Main tab navigation
│   │   │   │   ├── _layout.tsx    # Tab bar layout
│   │   │   │   ├── index.tsx      # Home Dashboard
│   │   │   │   ├── browse.tsx     # Surah Browser
│   │   │   │   ├── progress.tsx   # Progress/Stats
│   │   │   │   └── settings.tsx   # Settings
│   │   │   ├── onboarding/
│   │   │   │   ├── welcome.tsx
│   │   │   │   ├── pick-reciter.tsx
│   │   │   │   └── start.tsx
│   │   │   ├── surah/
│   │   │   │   └── [surahId].tsx  # Ayah list for a surah
│   │   │   ├── studio/
│   │   │   │   └── [ayahId].tsx   # Recitation Studio
│   │   │   ├── results/
│   │   │   │   └── [recordingId].tsx  # Results/Feedback
│   │   │   ├── reciter/
│   │   │   │   └── [reciterId].tsx    # Reciter Profile
│   │   │   └── _layout.tsx        # Root layout
│   │   ├── components/
│   │   │   ├── ui/                # Design system primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── ProgressRing.tsx
│   │   │   │   ├── ScoreBar.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   └── Typography.tsx
│   │   │   ├── audio/
│   │   │   │   ├── RecordButton.tsx       # Animated record button with amplitude ring
│   │   │   │   ├── ReferencePlayer.tsx    # Reference audio playback with waveform
│   │   │   │   ├── WaveformView.tsx       # Waveform visualization
│   │   │   │   └── AmplitudeRing.tsx      # Real-time amplitude ring animation
│   │   │   ├── results/
│   │   │   │   ├── PitchOverlay.tsx       # Skia-based pitch contour comparison chart
│   │   │   │   ├── ScoreSummary.tsx       # Circular score + label
│   │   │   │   ├── DimensionBreakdown.tsx # 4 dimension score bars
│   │   │   │   └── FeedbackCard.tsx       # Natural language feedback
│   │   │   ├── quran/
│   │   │   │   ├── AyahText.tsx           # Arabic text with tashkeel
│   │   │   │   ├── SurahCard.tsx          # Surah list item
│   │   │   │   └── AyahListItem.tsx       # Ayah list item with status
│   │   │   └── layout/
│   │   │       ├── SafeArea.tsx
│   │   │       ├── ScreenHeader.tsx
│   │   │       └── LoadingScreen.tsx      # Analysis waiting state
│   │   ├── core/
│   │   │   ├── audio/                 # Centralized audio engine (see Section 16)
│   │   │   │   ├── audioEngine.ts     # Single owner of all record/play, session switching
│   │   │   │   ├── audioSession.ts    # iOS/Android audio session configuration
│   │   │   │   ├── audioPermissions.ts # Permission request + status tracking
│   │   │   │   └── types.ts           # Audio engine types and event interfaces
│   │   │   └── api/                   # Centralized API layer (see Section 16)
│   │   │       ├── client.ts          # Base URL, auth headers, retries, timeout, error normalization
│   │   │       ├── endpoints.ts       # Typed endpoint functions (getSurahs, submitAnalysis, etc.)
│   │   │       └── upload.ts          # Upload URL request, file upload, progress events
│   │   ├── hooks/
│   │   │   ├── useAudioRecorder.ts    # Recording hook — delegates to core/audio/audioEngine
│   │   │   ├── useAudioPlayer.ts      # Playback hook — delegates to core/audio/audioEngine
│   │   │   ├── useAnalysis.ts         # Submit recording + poll for results
│   │   │   ├── useAmplitude.ts        # Real-time amplitude metering (Reanimated shared values)
│   │   │   └── useAuth.ts             # Supabase auth state
│   │   ├── stores/
│   │   │   ├── authStore.ts           # Auth state (Zustand) — global
│   │   │   ├── settingsStore.ts       # User preferences — global
│   │   │   ├── progressStore.ts       # User progress data — global
│   │   │   ├── studioStore.ts         # Studio state machine — feature-local (see Section 16)
│   │   │   └── resultsStore.ts        # Current results view — feature-local
│   │   ├── lib/
│   │   │   ├── supabase.ts            # Supabase client init
│   │   │   └── constants.ts           # App-wide constants
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   └── index.ts
│   │   ├── assets/
│   │   │   └── fonts/
│   │   │       ├── Amiri-Regular.ttf      # Arabic Quranic text
│   │   │       ├── Amiri-Bold.ttf
│   │   │       ├── Inter-Regular.ttf      # UI text
│   │   │       ├── Inter-Medium.ttf
│   │   │       ├── Inter-SemiBold.ttf
│   │   │       └── Inter-Bold.ttf
│   │   ├── app.json
│   │   ├── eas.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                       # Next.js marketing site
│       ├── app/
│       │   ├── page.tsx           # Landing page
│       │   └── layout.tsx
│       ├── next.config.js
│       └── package.json
│
├── packages/
│   └── shared/                    # Shared TypeScript code
│       ├── types/
│       │   ├── surah.ts
│       │   ├── ayah.ts
│       │   ├── reciter.ts
│       │   ├── recording.ts
│       │   ├── analysis.ts
│       │   └── user.ts
│       ├── constants/
│       │   ├── surahs.ts         # Surah metadata (id, name, ayah count, difficulty)
│       │   └── reciters.ts       # Reciter metadata
│       ├── utils/
│       │   └── scoring.ts        # Score label computation (shared between FE/BE)
│       ├── tsconfig.json
│       └── package.json
│
├── services/
│   └── ml/                        # Python ML backend
│       ├── app/
│       │   ├── main.py            # FastAPI app entry
│       │   ├── config.py          # Environment config
│       │   ├── routers/
│       │   │   ├── analyze.py     # POST /ml/v1/analyze
│       │   │   ├── results.py     # GET /ml/v1/results/{job_id}
│       │   │   └── health.py      # GET /ml/v1/health
│       │   ├── pipeline/
│       │   │   ├── preprocessor.py    # Noise reduction, normalization, VAD
│       │   │   ├── transcriber.py     # faster-whisper ASR
│       │   │   ├── feature_extractor.py  # Pitch (pYIN), energy, spectral, pacing
│       │   │   ├── comparator.py      # DTW alignment + scoring
│       │   │   └── orchestrator.py    # Full pipeline coordination
│       │   ├── models/
│       │   │   ├── schemas.py         # Pydantic request/response models
│       │   │   └── enums.py           # Status enums
│       │   ├── services/
│       │   │   ├── storage.py         # S3/Supabase storage client
│       │   │   ├── cache.py           # Redis feature vector cache
│       │   │   └── feedback.py        # Rule-based feedback text generation
│       │   └── tasks/
│       │       └── analyze_task.py    # Celery task definition
│       ├── scripts/
│       │   ├── download_reference_audio.py   # Batch download from EveryAyah
│       │   ├── preprocess_references.py      # Batch feature extraction
│       │   └── seed_database.py              # Seed surahs, ayahs, reciters into Supabase
│       ├── tests/
│       │   ├── test_pipeline.py
│       │   ├── test_scoring.py
│       │   └── fixtures/              # Sample audio files for testing
│       ├── Dockerfile
│       ├── docker-compose.yml         # ML service + Redis
│       ├── requirements.txt
│       ├── celery_worker.py
│       └── pyproject.toml
│
├── turbo.json                     # Turborepo config
├── package.json                   # Root workspace config
├── .github/
│   └── workflows/
│       ├── lint.yml               # TypeScript lint + type check
│       ├── ml-tests.yml           # Python tests
│       └── eas-build.yml          # Expo EAS build on merge to main
└── CLAUDE.md                      # This file
```

---

## 5. DESIGN SYSTEM & UI/UX

### Color Palette

```typescript
// theme/colors.ts
export const colors = {
  // Primary palette — Islamic-inspired earth tones
  primary: {
    50:  '#E8F5EC',
    100: '#C8E6CF',
    200: '#A5D6B0',
    300: '#7DC48E',
    400: '#5CB675',
    500: '#2A9D6E',  // Primary action color
    600: '#1B6B4A',  // Primary dark — headers, emphasis
    700: '#155A3D',
    800: '#0F4830',
    900: '#0A3622',
  },
  
  // Gold accent — used sparingly for highlights, achievements, Bismillah
  gold: {
    300: '#E8C96B',
    400: '#D4AF37',  // Primary gold
    500: '#C19B2C',
    600: '#A68425',
  },

  // Neutral palette — warm grays, never pure black or pure white
  neutral: {
    0:   '#FFFFFF',
    50:  '#F8FAF9',  // Screen backgrounds
    100: '#F1F4F2',  // Card backgrounds
    200: '#E2E8E4',  // Borders, dividers
    300: '#C8D0CB',  // Disabled states
    400: '#9CA89F',  // Placeholder text
    500: '#6B7A6F',  // Secondary text
    600: '#4A5A4E',  // Body text
    700: '#2E3E32',  // Headings
    800: '#1A2A1E',  // Primary text
    900: '#0D1610',  // Near-black
  },

  // Semantic colors
  success: '#2A9D6E',  // Same as primary.500
  warning: '#D4AF37',  // Same as gold.400
  error:   '#C45B28',  // Warm red-orange (not harsh red)
  info:    '#3B82B0',  // Muted blue

  // Score level colors
  score: {
    beginner:   '#C45B28',  // Warm orange
    developing: '#D4AF37',  // Gold
    proficient: '#5CB675',  // Green
    advanced:   '#2A9D6E',  // Deep green
    master:     '#1B6B4A',  // Darkest green
  },
} as const;
```

### Typography

```typescript
// theme/typography.ts
export const typography = {
  // Arabic Quranic text — ALWAYS use Amiri
  arabic: {
    family: 'Amiri',
    // Sizes for Quranic text display
    ayahLarge:   { fontSize: 32, lineHeight: 56 },  // Studio screen
    ayahMedium:  { fontSize: 24, lineHeight: 42 },  // Ayah list
    ayahSmall:   { fontSize: 20, lineHeight: 36 },  // Compact views
    bismillah:   { fontSize: 28, lineHeight: 48 },  // Bismillah display
  },

  // UI text — ALWAYS use Inter
  ui: {
    family: 'Inter',
    // Scale
    h1:       { fontSize: 28, lineHeight: 36, fontWeight: '700' },
    h2:       { fontSize: 22, lineHeight: 28, fontWeight: '600' },
    h3:       { fontSize: 18, lineHeight: 24, fontWeight: '600' },
    bodyLg:   { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    body:     { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    bodySm:   { fontSize: 12, lineHeight: 16, fontWeight: '400' },
    caption:  { fontSize: 11, lineHeight: 14, fontWeight: '400' },
    label:    { fontSize: 14, lineHeight: 20, fontWeight: '500' },
    button:   { fontSize: 16, lineHeight: 20, fontWeight: '600' },
    // Special
    scoreXL:  { fontSize: 48, lineHeight: 52, fontWeight: '700' }, // Main score display
    scoreLg:  { fontSize: 32, lineHeight: 36, fontWeight: '700' }, // Dimension scores
  },
} as const;
```

### Spacing Scale

```typescript
// theme/spacing.ts
export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
} as const;
```

### Design Rules (MUST FOLLOW)

1. **No harsh colors.** Never use pure `#000000` or `#FF0000`. All colors come from the palette above.
2. **No flashy animations.** Animations are subtle and purposeful: gentle fades, smooth slides, soft pulses. Maximum animation duration: 400ms for transitions, 200ms for micro-interactions. Exception: the recording amplitude ring which animates continuously.
3. **Arabic text is sacred.** The Quranic Arabic text (`AyahText` component) always uses Amiri font, always displays full tashkeel, always has generous line-height (1.75x minimum), and is NEVER truncated with ellipsis. If it doesn't fit, the container scrolls.
4. **One-thumb reachability.** The record button (the most-used element) sits at the bottom of the screen within natural thumb reach. Primary actions are always at the bottom; information display at the top.
5. **Progressive disclosure.** Show the overall score first. Dimension breakdown expands on tap. Pitch overlay expands on tap. Never overwhelm with data on first view.
6. **Loading states are content.** Never show a spinner. Use skeleton placeholders for data loading. For the analysis wait state (~5-8s), show a purposeful animated screen with rotating messages ("Analyzing your melody...", "Comparing your rhythm...").
7. **Every score gets encouragement.** The `FeedbackCard` component ALWAYS includes a positive note before any suggestion. Template: "[Something you did well]. [Specific actionable suggestion for improvement]."
8. **Shadows are minimal.** Use only `elevation: 1` (subtle) or `elevation: 2` (cards). Never heavy drop shadows. The aesthetic is flat with depth cues from color, not shadows.
9. **Icons use Lucide.** Consistent icon set via `lucide-react-native`. Never mix icon libraries.
10. **Bottom tab bar has 4 tabs:** Home, Browse (surahs), Progress, Settings. Use filled icons for active state, outline for inactive. Tab bar background: `neutral.0` with a subtle top border in `neutral.200`.

### Key Component Specs

#### RecordButton
- Size: 80x80 logical pixels
- Idle state: Solid circle in `primary.500` with a microphone icon (white, 32px)
- Recording state: Circle pulses gently (scale 1.0 → 1.05 → 1.0 over 1.5s, repeating). An `AmplitudeRing` (a glowing ring whose radius fluctuates with mic amplitude) surrounds the button. Ring color: `primary.300` with 40% opacity. Ring radius range: 44px (silence) to 64px (loud).
- Press feedback: `expo-haptics` medium impact on start, light impact on stop
- Transition: 200ms ease-in-out

#### ProgressRing (Score Display)
- Size: 160x160 on Results screen
- Animated SVG circle that fills clockwise from 0 to the score percentage over 1.2 seconds
- Stroke color determined by score level: uses `colors.score[level]`
- Score number animates up (counting from 0 to actual score) in sync with ring fill
- Quality label appears below the ring after the animation completes (fade in, 200ms delay)
- Labels: 0-40% = "Beginning", 40-60% = "Developing", 60-80% = "Proficient", 80-95% = "Advanced", 95-100% = "Master"

#### PitchOverlay
- Built with `@shopify/react-native-skia` for GPU-accelerated rendering
- Shows two pitch contour curves on a shared time axis (X = time in seconds, Y = frequency in Hz)
- Reference reciter curve: `primary.200` (muted), 2px stroke
- User's curve: `gold.400`, 2.5px stroke
- Regions of significant divergence (DTW cost above threshold): highlighted background band in `error` at 10% opacity
- X-axis shows time markers every 1 second
- Interactive: tap on any point to hear that moment in both recordings (play 1.5s clip centered on tap point)
- Container height: 200px
- Horizontal scroll if the recitation is longer than the screen width (scale: 100px per second)

---

## 6. MOBILE APP (EXPO/REACT NATIVE)

### Expo Configuration

```json
// app.json (key fields)
{
  "expo": {
    "name": "Qiraa",
    "slug": "qiraa",
    "scheme": "qiraa",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "plugins": [
      "expo-router",
      [
        "expo-av",
        {
          "microphonePermission": "Qiraa needs microphone access to record your recitation."
        }
      ],
      "expo-haptics",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#2A9D6E"
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.qiraa.app",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Qiraa needs microphone access to record your Quran recitation for analysis.",
        "UIBackgroundModes": ["audio"]
      }
    },
    "android": {
      "package": "com.qiraa.app",
      "permissions": ["RECORD_AUDIO"]
    }
  }
}
```

### Audio Recording Configuration

```typescript
// hooks/useAudioRecorder.ts — critical configuration
import { Audio } from 'expo-av';

// MUST use these exact settings for ML pipeline compatibility
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true, // Required for amplitude ring
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000,      // 16kHz — required by Whisper
    numberOfChannels: 1,     // Mono — required by pipeline
    bitRate: 256000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,       // 16kHz — required by Whisper
    numberOfChannels: 1,      // Mono — required by pipeline
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {},
};

// Audio session configuration — CRITICAL for iOS
// Must set this BEFORE starting recording
async function configureAudioSession() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,    // Must be true for recording
    staysActiveInBackground: false, // Phase 1: no background recording
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

// When switching FROM recording TO playback (e.g., to play reference audio):
async function configurePlaybackSession() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,     // Must toggle this for playback
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}
```

**IMPORTANT:** On iOS, you MUST toggle `allowsRecordingIOS` between recording and playback modes. If you leave it `true` while trying to play audio, the audio may route through the earpiece instead of the speaker. Always call `configurePlaybackSession()` before playing reference audio and `configureAudioSession()` before recording.

### Amplitude Metering

```typescript
// Inside useAudioRecorder hook — for driving the AmplitudeRing animation
// expo-av provides metering data when isMeteringEnabled is true

const onRecordingStatusUpdate = (status: Audio.RecordingStatus) => {
  if (status.isRecording && status.metering !== undefined) {
    // status.metering is in dBFS (negative values, 0 = max, -160 = silence)
    // Normalize to 0-1 range for the amplitude ring
    const normalized = Math.max(0, (status.metering + 60) / 60); // -60dB to 0dB range
    amplitudeValue.value = withSpring(normalized, {
      damping: 15,
      stiffness: 150,
    });
  }
};

recording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);
recording.setProgressUpdateInterval(50); // Update every 50ms for smooth animation
```

### Navigation Structure

```
Root Layout (_layout.tsx)
├── (auth) group — shown when not authenticated
│   ├── login.tsx
│   └── signup.tsx
├── onboarding/ — shown once after first signup
│   ├── welcome.tsx
│   ├── pick-reciter.tsx
│   └── start.tsx
└── (tabs) group — main app
    ├── index.tsx (Home)
    ├── browse.tsx (Surah Browser)
    ├── progress.tsx (Progress/Stats)
    └── settings.tsx
    
Deep links from tabs:
├── surah/[surahId].tsx (Ayah List)
├── studio/[ayahId].tsx (Recitation Studio)
├── results/[recordingId].tsx (Results)
└── reciter/[reciterId].tsx (Reciter Profile)
```

---

## 7. ML BACKEND (PYTHON/FASTAPI)

### Application Structure

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analyze, results, health
from app.config import settings

app = FastAPI(
    title="Qiraa ML Service",
    version="1.0.0",
    docs_url="/ml/v1/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/ml/v1")
app.include_router(analyze.router, prefix="/ml/v1")
app.include_router(results.router, prefix="/ml/v1")

@app.on_event("startup")
async def load_models():
    """Pre-load ML models into memory on startup. NEVER load per-request."""
    from app.pipeline.transcriber import load_whisper_model
    from app.pipeline.preprocessor import load_vad_model
    load_whisper_model()  # ~2GB into VRAM
    load_vad_model()      # ~50MB into RAM
```

### Pipeline Orchestrator

```python
# app/pipeline/orchestrator.py
"""
Full analysis pipeline. Called by Celery task.
Total target latency: < 8 seconds.
"""

import time
from app.pipeline.preprocessor import preprocess_audio
from app.pipeline.transcriber import transcribe
from app.pipeline.feature_extractor import extract_features
from app.pipeline.comparator import compare_with_reference
from app.services.cache import get_reference_features
from app.services.feedback import generate_feedback

async def analyze_recording(
    audio_path: str,
    ayah_id: str,
    reciter_id: str,
    expected_text: str,
) -> dict:
    start = time.time()
    
    # Step 1: Preprocess (~0.5s)
    # - Convert to 16kHz mono float32
    # - Apply spectral gating noise reduction
    # - Trim silence via Silero VAD
    # - Normalize to -23 LUFS
    clean_audio, sample_rate = preprocess_audio(audio_path)
    
    # Step 2: ASR via faster-whisper (~2-3s)
    # - Returns transcribed text + word-level timestamps
    transcription = transcribe(clean_audio, sample_rate)
    
    # Step 3: Feature extraction (~0.5s)
    # - Pitch contour (F0 via pYIN)
    # - Energy contour (RMS)
    # - Word duration ratios (from Whisper timestamps)
    # - Spectral centroid
    user_features = extract_features(clean_audio, sample_rate, transcription)
    
    # Step 4: Load reference features from cache (~0.1s)
    ref_features = get_reference_features(reciter_id, ayah_id)
    
    # Step 5: Compare + Score (~0.3s)
    # - DTW on pitch contours
    # - Cosine similarity on duration ratios
    # - Levenshtein on transcribed text vs expected
    # - DTW on energy contours
    scores, alignment_data = compare_with_reference(
        user_features, ref_features, transcription.text, expected_text
    )
    
    # Step 6: Generate feedback text (~0.01s)
    feedback = generate_feedback(scores, reciter_id)
    
    elapsed = time.time() - start
    
    return {
        "overall_score": scores.overall,
        "pitch_score": scores.pitch,
        "rhythm_score": scores.rhythm,
        "text_score": scores.text,
        "energy_score": scores.energy,
        "pitch_contour_user": user_features.pitch_contour.tolist(),
        "pitch_contour_reference": ref_features.pitch_contour.tolist(),
        "dtw_alignment_path": alignment_data.path.tolist(),
        "feedback_text": feedback,
        "processing_time_ms": int(elapsed * 1000),
    }
```

### Feature Extraction Details

```python
# app/pipeline/feature_extractor.py

import librosa
import numpy as np

def extract_pitch_contour(audio: np.ndarray, sr: int = 16000) -> np.ndarray:
    """
    Extract F0 (fundamental frequency) using pYIN algorithm.
    Returns array of F0 values in Hz, with NaN for unvoiced frames.
    """
    f0, voiced_flag, voiced_probs = librosa.pyin(
        audio,
        fmin=60,       # Lowest expected pitch (Hz) — covers deep male voices
        fmax=600,      # Highest expected pitch (Hz) — covers female voices
        sr=sr,
        hop_length=512,  # ~32ms per frame at 16kHz
        fill_na=0.0,     # Replace NaN with 0 for DTW compatibility
    )
    return f0

def extract_energy_contour(audio: np.ndarray, sr: int = 16000) -> np.ndarray:
    """Extract RMS energy per frame."""
    rms = librosa.feature.rms(y=audio, hop_length=512)[0]
    return rms

def extract_word_duration_ratios(word_timestamps: list[dict]) -> np.ndarray:
    """
    From Whisper word timestamps, compute relative duration of each word.
    Returns array of ratios that sum to 1.0 (proportion of total duration).
    """
    durations = np.array([w["end"] - w["start"] for w in word_timestamps])
    total = durations.sum()
    if total == 0:
        return np.ones(len(durations)) / len(durations)
    return durations / total
```

### Scoring Engine

```python
# app/pipeline/comparator.py

import numpy as np
from dtw import dtw
from scipy.spatial.distance import cosine

# Scoring weights — these are tunable and MUST be validated by Tajweed experts
WEIGHTS = {
    "pitch": 0.40,
    "rhythm": 0.30,
    "text": 0.20,
    "energy": 0.10,
}

def compute_pitch_similarity(user_pitch: np.ndarray, ref_pitch: np.ndarray) -> tuple[float, dict]:
    """
    Compare pitch contours using Dynamic Time Warping.
    Returns similarity score (0-1) and alignment data.
    """
    # Normalize pitch contours to remove absolute pitch differences
    # (we care about the SHAPE of the melody, not the absolute key)
    user_norm = _normalize_contour(user_pitch)
    ref_norm = _normalize_contour(ref_pitch)
    
    alignment = dtw(user_norm, ref_norm, keep_internals=True)
    
    # Normalize DTW distance to 0-1 similarity score
    max_possible_distance = len(user_norm) * np.max(np.abs(ref_norm))
    if max_possible_distance == 0:
        similarity = 0.0
    else:
        similarity = max(0.0, 1.0 - (alignment.distance / max_possible_distance))
    
    return similarity, {
        "path": np.array(alignment.index1s),  # Warping path for visualization
        "distance": float(alignment.distance),
    }

def compute_rhythm_similarity(user_ratios: np.ndarray, ref_ratios: np.ndarray) -> float:
    """
    Compare word duration ratio vectors using cosine similarity.
    Vectors must be same length (same number of words).
    """
    if len(user_ratios) != len(ref_ratios):
        # If word count differs, the user likely skipped or added words
        # Pad the shorter one with zeros
        max_len = max(len(user_ratios), len(ref_ratios))
        user_padded = np.pad(user_ratios, (0, max_len - len(user_ratios)))
        ref_padded = np.pad(ref_ratios, (0, max_len - len(ref_ratios)))
        return float(1.0 - cosine(user_padded, ref_padded))
    return float(1.0 - cosine(user_ratios, ref_ratios))

def compute_text_similarity(transcribed: str, expected: str) -> float:
    """
    Compare transcribed text vs expected ayah text using normalized Levenshtein distance.
    """
    # Normalize Arabic text: remove diacritics for comparison (Whisper often drops them)
    trans_clean = _strip_arabic_diacritics(transcribed)
    expected_clean = _strip_arabic_diacritics(expected)
    
    distance = _levenshtein_distance(trans_clean, expected_clean)
    max_len = max(len(trans_clean), len(expected_clean), 1)
    return max(0.0, 1.0 - (distance / max_len))

def compute_overall_score(pitch: float, rhythm: float, text: float, energy: float) -> float:
    """Weighted combination of all dimension scores."""
    return (
        WEIGHTS["pitch"] * pitch +
        WEIGHTS["rhythm"] * rhythm +
        WEIGHTS["text"] * text +
        WEIGHTS["energy"] * energy
    )

def _normalize_contour(contour: np.ndarray) -> np.ndarray:
    """Z-score normalize, replacing zeros (unvoiced) with interpolated values."""
    voiced = contour > 0
    if not np.any(voiced):
        return contour
    # Interpolate unvoiced regions
    interp = np.interp(np.arange(len(contour)), np.where(voiced)[0], contour[voiced])
    # Z-score normalize
    mean, std = interp.mean(), interp.std()
    if std == 0:
        return interp - mean
    return (interp - mean) / std
```

### Feedback Generation

```python
# app/services/feedback.py

def generate_feedback(scores: dict, reciter_id: str) -> str:
    """
    Rule-based feedback generation. Always leads with encouragement.
    No LLM needed — template system with conditionals.
    """
    reciter_name = RECITER_NAMES[reciter_id]
    
    # Find strongest and weakest dimension
    dimensions = {
        "melody": scores["pitch"],
        "rhythm": scores["rhythm"],
        "text accuracy": scores["text"],
        "vocal dynamics": scores["energy"],
    }
    strongest = max(dimensions, key=dimensions.get)
    weakest = min(dimensions, key=dimensions.get)
    
    # Encouragement (always first)
    if dimensions[strongest] >= 0.8:
        positive = f"Excellent {strongest}! You're really capturing that aspect of {reciter_name}'s style."
    elif dimensions[strongest] >= 0.6:
        positive = f"Your {strongest} is coming along nicely — good work!"
    else:
        positive = "Great effort — consistent practice is the path to improvement."
    
    # Suggestion (always specific and actionable)
    suggestions = {
        "melody": f"Try listening to {reciter_name}'s pitch changes at the end of each phrase, then mirror those rises and falls.",
        "rhythm": f"Focus on where {reciter_name} pauses and how long they hold each word. Try slowing down the reference to 0.75x speed.",
        "text accuracy": "Double-check the pronunciation of each word before recording. Listen to the reference one more time.",
        "vocal dynamics": f"Notice how {reciter_name} varies their volume — try emphasizing the same words they emphasize.",
    }
    
    return f"{positive} {suggestions[weakest]}"
```

---

## 8. DATABASE SCHEMA (SUPABASE)

```sql
-- Run this via Supabase SQL Editor or migration

-- Users table extends Supabase auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    preferred_reciter_id TEXT,
    onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Surahs (seeded, read-only)
CREATE TABLE public.surahs (
    id TEXT PRIMARY KEY,  -- e.g., "surah_001"
    number INTEGER NOT NULL UNIQUE,
    name_arabic TEXT NOT NULL,
    name_english TEXT NOT NULL,
    name_transliteration TEXT NOT NULL,
    total_ayahs INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    revelation_type TEXT,  -- 'meccan' or 'medinan'
    display_order INTEGER NOT NULL
);

-- Ayahs (seeded, read-only)
CREATE TABLE public.ayahs (
    id TEXT PRIMARY KEY,  -- e.g., "ayah_001_001" (surah_ayah)
    surah_id TEXT NOT NULL REFERENCES public.surahs(id),
    ayah_number INTEGER NOT NULL,
    text_uthmani TEXT NOT NULL,       -- Uthmani script with full tashkeel (for display)
    text_simple TEXT NOT NULL,        -- Simplified text without diacritics (for ASR comparison)
    juz INTEGER,
    page INTEGER,
    UNIQUE(surah_id, ayah_number)
);

-- Reciters (seeded, read-only)
CREATE TABLE public.reciters (
    id TEXT PRIMARY KEY,  -- e.g., "mishary_alafasy"
    name_english TEXT NOT NULL,
    name_arabic TEXT NOT NULL,
    bio TEXT NOT NULL,
    style_description TEXT NOT NULL,  -- e.g., "Melodic, warm, moderate pace"
    photo_url TEXT,
    sample_audio_url TEXT,            -- 30-second sample for reciter selection
    display_order INTEGER NOT NULL
);

-- Reference audio (seeded during data pipeline)
CREATE TABLE public.reference_audio (
    id TEXT PRIMARY KEY,
    reciter_id TEXT NOT NULL REFERENCES public.reciters(id),
    ayah_id TEXT NOT NULL REFERENCES public.ayahs(id),
    audio_url TEXT NOT NULL,          -- CDN URL for the audio file
    features_url TEXT NOT NULL,       -- S3 URL for pre-computed feature vectors (.npz)
    duration_ms INTEGER NOT NULL,
    UNIQUE(reciter_id, ayah_id)
);

-- User recordings
CREATE TABLE public.recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ayah_id TEXT NOT NULL REFERENCES public.ayahs(id),
    reciter_id TEXT NOT NULL REFERENCES public.reciters(id),
    audio_url TEXT NOT NULL,          -- Supabase Storage URL
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own recordings" ON public.recordings
    FOR ALL USING (auth.uid() = user_id);

-- Analysis results
CREATE TABLE public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID NOT NULL UNIQUE REFERENCES public.recordings(id) ON DELETE CASCADE,
    overall_score REAL NOT NULL CHECK (overall_score >= 0 AND overall_score <= 1),
    pitch_score REAL NOT NULL CHECK (pitch_score >= 0 AND pitch_score <= 1),
    rhythm_score REAL NOT NULL CHECK (rhythm_score >= 0 AND rhythm_score <= 1),
    text_score REAL NOT NULL CHECK (text_score >= 0 AND text_score <= 1),
    energy_score REAL NOT NULL CHECK (energy_score >= 0 AND energy_score <= 1),
    pitch_contour_user JSONB,         -- Array of F0 values (user)
    pitch_contour_reference JSONB,    -- Array of F0 values (reference, DTW-aligned)
    dtw_alignment_path JSONB,         -- DTW warping path for visualization
    feedback_text TEXT NOT NULL,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own results" ON public.analysis_results
    FOR SELECT USING (
        recording_id IN (SELECT id FROM public.recordings WHERE user_id = auth.uid())
    );

-- User progress (aggregated per surah/reciter pair)
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    surah_id TEXT NOT NULL REFERENCES public.surahs(id),
    reciter_id TEXT NOT NULL REFERENCES public.reciters(id),
    best_score REAL DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    UNIQUE(user_id, surah_id, reciter_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- Streaks
CREATE TABLE public.streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own streaks" ON public.streaks
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX idx_recordings_user_id ON public.recordings(user_id);
CREATE INDEX idx_recordings_ayah_reciter ON public.recordings(ayah_id, reciter_id);
CREATE INDEX idx_analysis_results_recording ON public.analysis_results(recording_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_reference_audio_reciter_ayah ON public.reference_audio(reciter_id, ayah_id);
```

---

## 9. API CONTRACTS

### ML Backend Endpoints

```
POST   /ml/v1/analyze
GET    /ml/v1/results/{job_id}
GET    /ml/v1/health
```

#### POST /ml/v1/analyze

```typescript
// Request
{
  audio_url: string;       // Supabase Storage URL of the recording
  ayah_id: string;         // e.g., "ayah_001_001"
  reciter_id: string;      // e.g., "mishary_alafasy"
  expected_text: string;   // The expected Arabic text (simple, no diacritics)
}

// Response (202 Accepted)
{
  job_id: string;          // UUID for polling
  status: "queued";
}
```

#### GET /ml/v1/results/{job_id}

```typescript
// Response when pending
{
  job_id: string;
  status: "processing";
  stage: "transcribing" | "extracting" | "comparing" | "scoring";  // For progress UI
}

// Response when complete
{
  job_id: string;
  status: "completed";
  results: {
    overall_score: number;           // 0.0 - 1.0
    pitch_score: number;             // 0.0 - 1.0
    rhythm_score: number;            // 0.0 - 1.0
    text_score: number;              // 0.0 - 1.0
    energy_score: number;            // 0.0 - 1.0
    pitch_contour_user: number[];    // F0 array for visualization
    pitch_contour_reference: number[]; // DTW-aligned ref F0 array
    dtw_alignment_path: number[];    // Warping path indices
    feedback_text: string;           // Natural language feedback
    processing_time_ms: number;
  };
}

// Response on error
{
  job_id: string;
  status: "error";
  error: {
    code: "audio_too_short" | "audio_too_noisy" | "wrong_text" | "processing_failed";
    message: string;  // Human-readable error
  };
}
```

### Supabase Queries (via JS client)

All surah, ayah, reciter, and reference audio data is read directly from Supabase using the JS client. User recordings and results are written/read via Supabase as well. There are no custom Supabase Edge Functions needed for Phase 1 — the `@supabase/supabase-js` client handles auth, database queries, and storage uploads directly.

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@shared/types/database';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

// Example: Fetch surahs
const { data: surahs } = await supabase
  .from('surahs')
  .select('*')
  .order('display_order');

// Example: Upload recording
const { data, error } = await supabase.storage
  .from('recordings')
  .upload(`${userId}/${recordingId}.wav`, audioBlob, {
    contentType: 'audio/wav',
  });

// Example: Fetch user's score history for a surah
const { data: results } = await supabase
  .from('analysis_results')
  .select('overall_score, created_at, recordings!inner(ayah_id, reciter_id)')
  .eq('recordings.user_id', userId)
  .eq('recordings.ayah_id', ayahId)
  .order('created_at', { ascending: true });
```

---

## 10. AUDIO PIPELINE

### Preprocessing Details

```python
# app/pipeline/preprocessor.py

import numpy as np
import librosa
import noisereduce as nr
from silero_vad import load_silero_vad, get_speech_timestamps

# Pre-loaded at startup
vad_model = None

def load_vad_model():
    global vad_model
    vad_model = load_silero_vad()

def preprocess_audio(file_path: str) -> tuple[np.ndarray, int]:
    """
    Full preprocessing pipeline.
    Input: path to audio file (any format)
    Output: (clean_audio_array, sample_rate=16000)
    """
    TARGET_SR = 16000
    
    # Load and convert to 16kHz mono
    audio, sr = librosa.load(file_path, sr=TARGET_SR, mono=True)
    
    # Reject too-short recordings (< 1 second)
    if len(audio) / TARGET_SR < 1.0:
        raise ValueError("AUDIO_TOO_SHORT: Recording must be at least 1 second.")
    
    # Reject too-long recordings (> 5 minutes)
    if len(audio) / TARGET_SR > 300:
        raise ValueError("AUDIO_TOO_LONG: Recording must be under 5 minutes.")
    
    # Step 1: Noise reduction via spectral gating
    audio = nr.reduce_noise(y=audio, sr=TARGET_SR, prop_decrease=0.75)
    
    # Step 2: Voice Activity Detection — trim silence
    import torch
    audio_tensor = torch.from_numpy(audio).float()
    speech_timestamps = get_speech_timestamps(audio_tensor, vad_model, sampling_rate=TARGET_SR)
    
    if not speech_timestamps:
        raise ValueError("AUDIO_TOO_NOISY: No speech detected in recording.")
    
    # Trim to first/last speech with 200ms padding
    start = max(0, speech_timestamps[0]['start'] - int(0.2 * TARGET_SR))
    end = min(len(audio), speech_timestamps[-1]['end'] + int(0.2 * TARGET_SR))
    audio = audio[start:end]
    
    # Step 3: Loudness normalization to -23 LUFS
    audio = _normalize_loudness(audio, TARGET_SR, target_lufs=-23)
    
    return audio, TARGET_SR
```

---

## 11. SCORING ENGINE

See Section 7 (`app/pipeline/comparator.py`) for full implementation.

### Score → Label Mapping (shared between frontend and backend)

```typescript
// packages/shared/utils/scoring.ts

export type ScoreLevel = 'beginner' | 'developing' | 'proficient' | 'advanced' | 'master';

export function getScoreLevel(score: number): ScoreLevel {
  // score is 0.0 - 1.0
  if (score >= 0.95) return 'master';
  if (score >= 0.80) return 'advanced';
  if (score >= 0.60) return 'proficient';
  if (score >= 0.40) return 'developing';
  return 'beginner';
}

export function getScoreLabel(level: ScoreLevel): string {
  const labels: Record<ScoreLevel, string> = {
    beginner: 'Beginning',
    developing: 'Developing',
    proficient: 'Proficient',
    advanced: 'Advanced',
    master: 'Master',
  };
  return labels[level];
}

export function getScorePercentage(score: number): number {
  return Math.round(score * 100);
}
```

---

## 12. REFERENCE AUDIO DATA

### Source
- **Primary:** EveryAyah.com — provides per-ayah MP3s for 100+ reciters
- **API URL pattern:** `https://everyayah.com/data/{reciter_folder}/{surah_number}{ayah_number}.mp3`
- **Reciter folder names:**
  - Mishary Al-Afasy: `Alafasy_128kbps`
  - Al-Sudais: `Abdurrahmaan_As-Sudais_192kbps`
  - Al-Husary: `Husary_128kbps`
  - Abdul Basit: `Abdul_Basit_Murattal_192kbps`
  - Al-Muaiqly: `MauroAlMuiqly128kbps` (verify this)

### Pre-processing Script

The `scripts/preprocess_references.py` script must be run ONCE before the app is usable:

1. Download all per-ayah MP3s for 5 reciters × 10 surahs (~3,200 files)
2. Convert each to 16kHz mono WAV
3. Extract features: pitch contour (pYIN), energy contour (RMS), word timestamps (Whisper)
4. Save features as `.npz` files (NumPy compressed)
5. Upload audio files to S3/CloudFront CDN
6. Upload feature files to S3
7. Seed the `reference_audio` table in Supabase with URLs and durations

### Feature Vector Format

```python
# Each .npz file contains:
{
    "pitch_contour": np.ndarray,    # Shape: (n_frames,) — F0 in Hz, 0 for unvoiced
    "energy_contour": np.ndarray,   # Shape: (n_frames,) — RMS energy
    "word_durations": np.ndarray,   # Shape: (n_words,) — duration ratios (sum to 1.0)
    "word_timestamps": list,        # [{"word": str, "start": float, "end": float}, ...]
    "duration_seconds": float,      # Total audio duration
    "sample_rate": int,             # Always 16000
    "hop_length": int,              # Always 512
}
```

---

## 13. AUTHENTICATION & AUTHORIZATION

### Supabase Auth Configuration
- **Providers:** Email/password, Google OAuth, Apple Sign In
- **Apple Sign In is REQUIRED for iOS App Store** — do not skip this
- **Session management:** Supabase handles JWT refresh automatically via the JS client
- **On signup:** Create a row in `profiles` table with `onboarded: false`
- **After onboarding:** Update `profiles.onboarded = true` and `profiles.preferred_reciter_id`

### Auth Flow

```
App opens
  → Check Supabase session
    → No session → Show (auth) screens (login/signup)
    → Has session → Check profiles.onboarded
      → Not onboarded → Show onboarding flow
      → Onboarded → Show (tabs) main app
```

### Auth Store

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: { name: string; preferred_reciter_id: string; onboarded: boolean } | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: AuthState['profile']) => void;
}
```

---

## 14. SCREEN SPECIFICATIONS

### Recitation Studio (Most Complex Screen)

```
┌─────────────────────────────────┐
│  ← Back          Al-Fatiha 1:1  │  ← ScreenHeader
│─────────────────────────────────│
│                                 │
│   بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ   │  ← AyahText (Amiri, 32px, centered)
│                                 │
│─────────────────────────────────│
│                                 │
│  ▶  ████████████████░░░░  1x   │  ← ReferencePlayer
│     0:00 / 0:04                 │     (play button, waveform, speed toggle)
│                                 │
│─────────────────────────────────│
│                                 │
│                                 │
│            ┌──────┐             │
│            │  🎤  │             │  ← RecordButton (80x80, centered)
│            └──────┘             │     AmplitudeRing surrounds during recording
│             0:00                │  ← Timer (appears during recording)
│                                 │
│  Swipe ← for next ayah         │  ← Hint text (subtle, neutral.400)
│                                 │
└─────────────────────────────────┘
```

**State machine for this screen (see Section 16 for full architecture):**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  idle ──→ preparingReference ──→ ready ←──────────────────────┐    │
│                                    │                           │    │
│                                    ├──→ playingReference ──→ ready  │
│                                    │                           │    │
│                                    └──→ recording ──→ recorded │    │
│                                                         │      │    │
│                                                         ▼      │    │
│                                                     uploading  │    │
│                                                         │      │    │
│                                                         ▼      │    │
│                                                     analyzing  │    │
│                                                         │      │    │
│                                                         ▼      │    │
│                                                    resultsReady ┘    │
│                                                                     │
│  Substates (can overlay any primary state):                         │
│    • permissionDenied — mic permission not granted                  │
│    • interrupted — incoming call, AirPods disconnect, alarm         │
│    • networkRetrying — upload failed, retrying with backoff         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Transition rules (enforced by studioStore — see Section 16):**

| From | To | Trigger | Guard |
|---|---|---|---|
| `idle` | `preparingReference` | Screen mounts with valid ayahId | — |
| `preparingReference` | `ready` | Reference audio loaded + buffered | Audio preload succeeds |
| `ready` | `playingReference` | User taps play on ReferencePlayer | Not in recording mode |
| `playingReference` | `ready` | Playback completes or user taps stop | — |
| `ready` | `recording` | User taps RecordButton | Mic permission granted, no active playback |
| `recording` | `recorded` | User taps stop | Minimum 1s recorded |
| `recorded` | `uploading` | Automatic (immediately after stop) | Valid recording URI exists |
| `uploading` | `analyzing` | Upload completes, job_id received | — |
| `analyzing` | `resultsReady` | Poll returns `status: "completed"` | — |
| `resultsReady` | `ready` | User taps Retry | Reset recording state |
| Any state | `error` | Unrecoverable failure | — |
| `error` | `idle` | User taps Retry | — |

**What should NEVER happen:**
- Playback starting while `recording` is active (audio session conflict)
- Two concurrent recordings (double-tap on RecordButton)
- Upload triggered before a valid recording exists
- Controls showing mismatched state during analysis
- Reference player enabled during recording

During RECORDING:
- RecordButton shows pulse animation
- AmplitudeRing shows real-time mic levels (via Reanimated shared values, NOT React state)
- Timer counts up
- Reference player is disabled (grayed out, non-interactive)

During UPLOADING:
- Navigate to LoadingScreen
- Upload audio to Supabase Storage
- POST to /ml/v1/analyze
- Show "Uploading your recitation..."
- On network failure: transition to `networkRetrying` substate, retry with exponential backoff (max 3 attempts)

During ANALYZING:
- Poll GET /ml/v1/results/{job_id} every 1.5s
- Rotate status messages based on response.stage:
  - "transcribing" → "Listening to your recitation..."
  - "extracting" → "Analyzing your melody..."
  - "comparing" → "Comparing your rhythm..."
  - "scoring" → "Calculating your score..."

On INTERRUPTED (incoming call, AirPods disconnect, etc.):
- If recording: stop recording gracefully, preserve audio, transition to `recorded`
- If playing reference: pause playback, resume when interruption ends
- Never silently lose a recording

On completion:
- Navigate to Results screen with recording ID
```

### Results Screen

```
┌─────────────────────────────────┐
│  ← Back               Share ↗  │
│─────────────────────────────────│
│                                 │
│          ╭──────────╮           │
│         │    78%    │           │  ← ProgressRing (animated fill)
│          ╰──────────╯           │
│          Proficient             │  ← Score label (fade in after ring)
│                                 │
│  ┌─────────────────────────┐   │
│  │ Melody Match    ████░ 82%│  │  ← DimensionBreakdown
│  │ Rhythm Match    ███░░ 71%│  │     (4 horizontal bars)
│  │ Text Accuracy   ████░ 85%│  │
│  │ Dynamics        ███░░ 68%│  │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📝 Your pacing was      │   │  ← FeedbackCard
│  │ strong! Try listening... │   │
│  └─────────────────────────┘   │
│                                 │
│  ▼ Tap to see pitch comparison  │  ← Expandable PitchOverlay
│  ┌─────────────────────────┐   │
│  │ ~~~/\~~~~/\~~~~          │   │  ← PitchOverlay (Skia canvas)
│  │ ~~~/~~\~/~~~\~~          │   │     Reference = muted, User = gold
│  └─────────────────────────┘   │
│                                 │
│  [🔄 Retry]    [Next Ayah →]   │  ← Action buttons (bottom)
│                                 │
└─────────────────────────────────┘
```

---

## 15. STATE MANAGEMENT

### Architecture: Zustand with strict responsibility boundaries

State is split into three tiers. Mixing tiers causes either performance problems or architectural spaghetti.

### Tier 1: Global Zustand Stores

Stores that persist across screens and are read by many parts of the app. These live in `stores/` and are created with `create()` from Zustand.

```typescript
// stores/authStore.ts — Auth state
interface AuthState {
  session: Session | null;
  user: User | null;
  profile: { name: string; preferred_reciter_id: string; onboarded: boolean } | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: AuthState['profile']) => void;
}

// stores/settingsStore.ts — User preferences
interface SettingsState {
  preferredReciterId: string | null;
  playbackSpeed: number;       // 0.75 | 1.0 | 1.25
  notificationsEnabled: boolean;
  setPreferredReciter: (id: string) => void;
  setPlaybackSpeed: (speed: number) => void;
}

// stores/progressStore.ts — Aggregated progress data
interface ProgressState {
  streak: { current: number; longest: number; lastActiveDate: string | null };
  surahProgress: Map<string, { bestScore: number; totalAttempts: number }>;
  recentResults: AnalysisResult[];
  fetchProgress: () => Promise<void>;
}
```

### Tier 2: Feature-Local Zustand Stores

Stores that own state for a specific feature flow. Created fresh when the feature mounts, reset when it unmounts. These also live in `stores/` but are scoped to one feature.

```typescript
// stores/studioStore.ts — Studio state machine (see Section 16 for full spec)
interface StudioState {
  // State machine
  status: StudioStatus;  // idle | preparingReference | ready | playingReference | recording | recorded | uploading | analyzing | resultsReady | error
  substate: StudioSubstate | null;  // permissionDenied | interrupted | networkRetrying | null
  
  // Session context
  surahId: string | null;
  ayahId: string | null;
  reciterId: string | null;
  
  // Recording data
  recordingUri: string | null;
  recordingDurationMs: number;
  
  // Analysis tracking
  analysisJobId: string | null;
  analysisStage: string | null;   // transcribing | extracting | comparing | scoring
  
  // Transitions (each enforces guards — see Section 14 transition table)
  initSession: (surahId: string, ayahId: string, reciterId: string) => void;
  onReferenceLoaded: () => void;
  startPlayback: () => void;
  stopPlayback: () => void;
  startRecording: () => void;
  stopRecording: (uri: string, durationMs: number) => void;
  onUploadComplete: (jobId: string) => void;
  onAnalysisStageUpdate: (stage: string) => void;
  onAnalysisComplete: () => void;
  onError: (error: StudioError) => void;
  onInterrupted: () => void;
  retry: () => void;
  reset: () => void;
}

// stores/resultsStore.ts — Current results view
interface ResultsState {
  recordingId: string | null;
  results: AnalysisResult | null;
  isExpanded: { dimensions: boolean; pitchOverlay: boolean };
  setResults: (recordingId: string, results: AnalysisResult) => void;
  toggleSection: (section: 'dimensions' | 'pitchOverlay') => void;
  reset: () => void;
}
```

### Tier 3: Animation & High-Frequency Values (NEVER in Zustand)

Any value that updates faster than ~4Hz (250ms) MUST use Reanimated shared values or component-local refs. Putting these in Zustand (or React state) causes full-tree re-renders and dropped frames.

**Values that belong in Tier 3 (never in a store):**
- Waveform amplitude (updates every 50ms during recording)
- Record button pulse animation progress
- Score ring fill progress during reveal animation
- Pitch overlay drawing coordinates
- Any spring/timing animation intermediate values

**How to wire them:**
```typescript
// Inside a hook or component — NOT in a Zustand store
const amplitudeValue = useSharedValue(0);  // Reanimated, drives AmplitudeRing
const pulseScale = useSharedValue(1);       // Reanimated, drives RecordButton pulse
const scoreProgress = useSharedValue(0);    // Reanimated, drives ProgressRing fill

// expo-av metering callback writes directly to shared value
const onMeteringUpdate = (metering: number) => {
  amplitudeValue.value = withSpring(normalize(metering), {
    damping: 15,
    stiffness: 150,
  });
};
```

### Rules (MUST FOLLOW)

1. **No store may import another store.** If two stores need to coordinate, the coordination happens in a hook or component that reads both.
2. **Feature stores reset on unmount.** When the user leaves the Studio screen, `studioStore.reset()` is called. Stale state from a previous session must never bleed into the next one.
3. **Global stores are hydrated once at app start.** `authStore` hydrates from Supabase session. `progressStore` fetches on app foreground. `settingsStore` reads from AsyncStorage.
4. **Transition methods enforce guards.** `studioStore.startRecording()` checks that `status === 'ready'` and `substate !== 'permissionDenied'` before transitioning. Invalid transitions are no-ops with a warning log, never crashes.
5. **No derived state in stores.** If you need `isRecording` (a boolean), derive it in the component: `const isRecording = useStudioStore(s => s.status === 'recording')`. Don't store redundant booleans.
```

5. **No derived state in stores.** If you need `isRecording` (a boolean), derive it in the component: `const isRecording = useStudioStore(s => s.status === 'recording')`. Don't store redundant booleans.

---

## 16. MOBILE ARCHITECTURE PATTERNS

This section covers the architectural patterns that make the difference between "works" and "feels like a native app." These are non-negotiable for Phase 1 quality.

### 16.1 Centralized Audio Engine

**The rule: all record/play actions go through one shared audio service. Never ad hoc inside components.**

The audio engine (`core/audio/audioEngine.ts`) is the single owner of:
- Microphone permission handling
- iOS/Android audio session mode switching
- Record start/stop
- Playback start/stop
- Audio interruption handling (calls, alarms, AirPods connect/disconnect)
- Metering updates (amplitude data for the AmplitudeRing)
- File normalization and upload preparation

This matters because iOS audio behavior is fragile. The `allowsRecordingIOS` toggle (Common Pitfall #1) is exactly the kind of bug that makes an app feel cheap even if the UI looks nice. By funneling everything through one service, the session state is always consistent.

```typescript
// core/audio/audioEngine.ts — Singleton, initialized once at app start

type AudioEngineState = 'idle' | 'configuredForPlayback' | 'configuredForRecording' | 'recording' | 'playing';

interface AudioEngine {
  // State
  getState(): AudioEngineState;
  
  // Session management (handles iOS allowsRecordingIOS toggle automatically)
  configureForPlayback(): Promise<void>;
  configureForRecording(): Promise<void>;
  
  // Recording
  startRecording(): Promise<void>;     // Calls configureForRecording() internally
  stopRecording(): Promise<{ uri: string; durationMs: number }>;
  
  // Playback
  loadSound(url: string): Promise<void>;
  play(): Promise<void>;               // Calls configureForPlayback() internally
  pause(): void;
  stop(): void;
  seekTo(positionMs: number): void;
  setPlaybackSpeed(rate: number): void;
  
  // Metering (for AmplitudeRing — writes to Reanimated shared value)
  onMeteringUpdate: ((normalized: number) => void) | null;
  
  // Interruption handling
  onInterruption: ((type: 'began' | 'ended') => void) | null;
  
  // Permissions
  requestMicPermission(): Promise<'granted' | 'denied' | 'undetermined'>;
  getMicPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'>;
  
  // Cleanup
  dispose(): Promise<void>;
}
```

**Critical behavior:**
- `startRecording()` MUST internally call `configureForRecording()` and verify the session is in recording mode before starting. If playback is active, it stops playback first.
- `play()` MUST internally call `configureForPlayback()` before starting. If recording is active, it rejects with an error (recording should be stopped explicitly by the user).
- On interruption (incoming call), if recording: stop recording gracefully, preserve the audio file, emit `onInterruption('began')`. The studioStore transitions to `interrupted` substate.
- The engine never throws on benign failures (e.g., stopping a recording that isn't active). It logs a warning and returns gracefully.

**Hooks delegate to the engine, they don't own audio logic:**
```typescript
// hooks/useAudioRecorder.ts — thin wrapper
export function useAudioRecorder() {
  const engine = useAudioEngine();  // Singleton via React context
  const studioStore = useStudioStore();
  
  const startRecording = useCallback(async () => {
    if (studioStore.status !== 'ready') return;  // Guard
    studioStore.startRecording();
    await engine.startRecording();
  }, [engine, studioStore]);
  
  // ... similar for stopRecording
}
```

### 16.2 Rendering Tier Separation

Not everything needs the same rendering approach. Using the wrong tier for a component either wastes performance or makes visuals janky.

| Tier | Technology | Use For | Examples |
|---|---|---|---|
| Standard RN | Views, Text, ScrollView | All layouts, text, lists, cards | SurahCard, AyahListItem, FeedbackCard, ScreenHeader |
| Reanimated | `useSharedValue` + `useAnimatedStyle` | Any motion at >4Hz or gesture-driven | AmplitudeRing, RecordButton pulse, ProgressRing fill, score counting |
| Skia | `@shopify/react-native-skia` Canvas | GPU-rendered custom 2D graphics | PitchOverlay contour chart, WaveformView |

**Rules:**
1. **Default to standard RN.** Only reach for Reanimated when something moves or animates. Only reach for Skia when standard RN can't draw what you need.
2. **Reanimated animations never touch React state.** The 50ms amplitude updates write to a `useSharedValue`. The pulse animation is a `withRepeat(withTiming(...))`. The score counting is a `withTiming` on a shared value. None of these trigger React re-renders.
3. **Skia components are isolated.** The `PitchOverlay` is a self-contained `<Canvas>` that receives data via props and draws everything internally. It does not read from Zustand during drawing — it receives pre-computed arrays.
4. **No re-rendering entire screens during recording.** The Studio screen during active recording should have zero React re-renders from amplitude updates. Verify with React DevTools Profiler.

### 16.3 API & Data Layer

The network layer is boring and centralized. No screen or hook directly constructs fetch requests.

```typescript
// core/api/client.ts — Base API client
// Owns: base URL, auth headers from Supabase session, retry logic, timeout defaults, error normalization

const API_BASE_URL = process.env.EXPO_PUBLIC_ML_BACKEND_URL;
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;  // For idempotent GET requests only

interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

async function apiRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  options?: { body?: unknown; timeout?: number; retries?: number }
): Promise<T>;
```

```typescript
// core/api/endpoints.ts — Typed endpoint functions
// Every ML backend call is a named function with typed input/output

export async function submitAnalysisJob(params: {
  audioUrl: string;
  ayahId: string;
  reciterId: string;
  expectedText: string;
}): Promise<{ jobId: string; status: 'queued' }>;

export async function getAnalysisStatus(jobId: string): Promise<AnalysisStatusResponse>;

// Supabase queries are also wrapped here for consistency
export async function getSurahs(): Promise<Surah[]>;
export async function getAyahs(surahId: string): Promise<Ayah[]>;
export async function getReciters(): Promise<Reciter[]>;
export async function getReferenceAudio(reciterId: string, ayahId: string): Promise<ReferenceAudio>;
export async function getUserProgress(userId: string): Promise<UserProgress[]>;
export async function getScoreHistory(userId: string, ayahId: string): Promise<AnalysisResult[]>;
```

```typescript
// core/api/upload.ts — Separate upload concerns
// Upload is async orchestration with progress events — it doesn't belong in a generic API client

export async function uploadRecording(params: {
  userId: string;
  recordingId: string;
  fileUri: string;
  onProgress?: (percent: number) => void;
}): Promise<{ audioUrl: string }>;
// Internally: request presigned URL → upload file → confirm → return public URL
```

**Why this structure:**
- `client.ts` is the only file that knows about auth headers, retries, and error normalization.
- `endpoints.ts` is the only file that screen code imports. If an endpoint changes, you change one function signature.
- `upload.ts` is separate because upload has progress events, retry semantics, and file handling that don't fit the standard request/response pattern.
- No screen or hook ever constructs a raw `fetch()` call.

### 16.4 Caching & Preloading Strategy

A lot of "native feel" is actually responsiveness, not framework choice. Users forgive cross-platform frameworks. They don't forgive lag.

**Cache locally (persist across sessions via AsyncStorage or Supabase local cache):**
- Current user session + profile
- Preferred reciter ID
- Recently opened surahs/ayahs metadata
- Surah and reciter lists (these change rarely — refresh on app foreground, max once per hour)

**Preload aggressively (in-memory, per navigation flow):**
- When user opens an ayah list: preload reference audio for the first ayah + preferred reciter
- When user enters Studio: preload reference audio for the current ayah (should already be cached from ayah list)
- When user finishes recording: while uploading, preload the next ayah's reference audio
- Reciter images: prefetch on Browse screen mount

**What to avoid during recording (JS thread budget is precious):**
- No JSON parsing in render paths
- No unnecessary logging during live recording
- No `useState`-driven meter animations (see Tier 3 in Section 15)
- No network requests except the metering callback writing to Reanimated

**Preloading implementation:**
```typescript
// In the ayah list screen or a prefetch hook
useEffect(() => {
  // When the user is browsing ayahs, preload audio for the most likely next action
  const prefetchAudio = async () => {
    const ref = await getReferenceAudio(preferredReciterId, firstAyahId);
    await audioEngine.loadSound(ref.audioUrl);  // Buffered and ready
  };
  prefetchAudio();
}, [preferredReciterId, firstAyahId]);
```

**Performance acceptance criteria (these are definition-of-done, not aspirational):**

| Metric | Target | Measurement |
|---|---|---|
| Recording start delay | < 300ms | From RecordButton press to `onRecordingStatusUpdate` firing |
| UI frame rate during recording | > 58 fps | RN Perf Monitor on iPhone 13 and Samsung A54 |
| Reference audio playback ready | < 1 second | From ayah selection to first audio frame playing |
| App cold start to interactive | < 3 seconds | From tap on app icon to Home screen fully rendered |
| Analysis round-trip | < 8 seconds | From upload completion to results received |
| Studio screen mount to ready | < 500ms | From navigation to `ready` state (reference loaded, controls active) |

### 16.5 iOS-Specific Quality Bars

The app must feel like an iPhone app, not a cross-platform app. These are hard release gates for iPhone — the app does not ship if any fail.

**Audio behavior (test on real devices, not simulator):**
- Speaker routing is correct after every record → playback switch (no earpiece audio)
- Recording survives switching between reference playback and recording 5+ times in a row
- Audio interruptions (incoming call, alarm, AirPods disconnect) recover gracefully
- Silent mode switch does not break recording or playback
- First-time mic permission flow is smooth (prompt appears, granting works immediately)

**Interaction quality:**
- Haptic feedback fires on RecordButton start (medium impact) and stop (light impact)
- Touch targets are at least 44x44pt
- Transitions between screens use native-feeling curves (not linear)
- No keyboard or scroll jank on any screen
- Safe area insets are respected on all device sizes (including iPhone SE and iPhone 15 Pro Max)

**If RN becomes the bottleneck for any audio behavior:** build or adopt a small native iOS bridge for the specific failing area (recording latency, metering precision, session switching). The architecture supports this — the `audioEngine` interface is an abstraction that can swap implementations.

### 16.6 Native Bridge Escape Hatch

The architecture is designed so the audio engine can be replaced with a native implementation without changing any hook, store, or component code.

```
Components → Hooks → AudioEngine interface → expo-av implementation (default)
                                            → Native iOS bridge (if needed)
                                            → Native Android bridge (if needed)
```

**When to pull this lever:**
- Recording start delay exceeds 300ms consistently on real devices
- Metering updates arrive with visible jitter (>100ms gaps)
- Audio session switching causes audible artifacts
- expo-av cannot handle a specific interruption scenario

**How:** Create `core/audio/nativeAudioEngine.ios.ts` that conforms to the same `AudioEngine` interface but uses a Turbo Module or Expo Module API to call native AVAudioSession / AVAudioRecorder directly. The rest of the app doesn't change.

---

## 17. ERROR HANDLING

### User-Facing Error Messages

| Error Code | User Message | Action |
|---|---|---|
| `audio_too_short` | "Your recording was too short. Try reciting at least one full verse." | Show retry button |
| `audio_too_noisy` | "We couldn't hear your voice clearly. Try recording in a quieter space." | Show retry button |
| `wrong_text` | "It seems like a different verse was recited. Please try again with the verse shown on screen." | Show retry + reference player |
| `processing_failed` | "Something went wrong on our end. Please try again." | Show retry + contact support link |
| `network_error` | "No internet connection. Please check your connection and try again." | Show retry button |
| `mic_permission_denied` | "Qiraa needs microphone access to record your recitation. Tap Settings to enable it." | Show "Open Settings" button |

### Error Boundaries

Every screen must have a top-level error boundary that catches render errors and shows a friendly message with a "Try Again" button that resets the screen state. Never show stack traces or technical errors to the user.

---

## 18. PERFORMANCE TARGETS

**These are definition-of-done criteria, not aspirational goals. See Section 16.4 for the caching and preloading strategies that achieve them.**

| Metric | Target | How to Verify |
|---|---|---|
| Audio analysis round-trip | < 8 seconds | Measure from upload completion to results received |
| App cold start | < 3 seconds | Test on iPhone 13 and Samsung A54 |
| Reference audio load | < 1 second | From ayah selection to playback ready (CDN-cached) |
| Recording start delay | < 300ms | From RecordButton press to `onRecordingStatusUpdate` firing |
| UI frame rate | > 58 fps | During recording animation (use RN perf monitor on real devices) |
| App bundle size | < 50 MB | Expo EAS build output |
| Studio screen mount to ready | < 500ms | From navigation to `ready` state (reference loaded, controls active) |
| Zero React re-renders during recording | 0 renders | Verify with React DevTools Profiler during 10s recording |

---

## 19. TESTING STRATEGY

### Unit Tests
- Scoring engine: Given known pitch contours, verify expected scores
- Score label mapping: Verify all boundary conditions
- Feedback generation: Verify templates produce correct output for all dimension combinations

### Integration Tests
- Full pipeline: Upload fixture audio → verify scores are within expected range
- Auth flow: Signup → login → session refresh → protected endpoint access
- Recording upload: Create recording → upload to storage → verify URL is accessible

### Device Testing (Manual, Pre-Launch)
- Audio recording on: iPhone 13, iPhone 15, Samsung A54, Pixel 7a, Redmi Note
- Arabic text rendering on all the above
- 60fps during recording animation on all the above
- Silent mode switch behavior on iOS
- Audio interruption handling (incoming call during recording)

### iOS Audio Quality Gates (Hard Release Gates — see Section 16.5)

These must pass on at least two real iPhones before any release. Do NOT rely on simulator testing for audio.

- [ ] Speaker routing is correct after every record → playback switch (no earpiece audio)
- [ ] Recording survives switching between reference playback and recording 5+ times in a row
- [ ] Audio interruptions (incoming call, alarm, AirPods disconnect) recover gracefully
- [ ] Silent mode switch does not break recording or playback
- [ ] First-time mic permission flow is smooth (prompt appears, granting works immediately)
- [ ] Bad network during upload/analyze shows appropriate error and allows retry
- [ ] Haptic feedback fires correctly on RecordButton start and stop
- [ ] Zero React re-renders during a 10-second recording session (verify with Profiler)

### Expert Validation
- 2-3 Tajweed-knowledgeable people recite same ayah at 3 quality levels
- Verify scores rank correctly: excellent > mediocre > poor
- Document results and adjust weights if needed
- **DO NOT LAUNCH without this validation passing**

---

## 20. DEPLOYMENT & CI/CD

### Mobile (Expo EAS)

```json
// eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "ios": { "autoIncrement": true },
      "android": { "autoIncrement": true }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "your@email.com", "ascAppId": "YOUR_APP_ID" },
      "android": { "serviceAccountKeyPath": "./google-play-key.json" }
    }
  }
}
```

**Build commands:**
- Development: `eas build --profile development --platform all`
- Beta (TestFlight + Internal Testing): `eas build --profile preview --platform all`
- Production: `eas build --profile production --platform all`
- Submit: `eas submit --platform all`

### ML Backend (Docker)

```dockerfile
# services/ml/Dockerfile
FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y python3.11 python3-pip ffmpeg
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Pre-download models during build (faster cold starts)
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('large-v3', device='cuda')"

CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120"]
```

### GitHub Actions

```yaml
# .github/workflows/lint.yml — runs on every PR
name: Lint & Type Check
on: [pull_request]
jobs:
  typescript:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx turbo lint typecheck

  python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r services/ml/requirements.txt
      - run: cd services/ml && python -m pytest tests/ -v
```

---

## 21. CODING STANDARDS

### TypeScript (Mobile + Web + Shared)
- **Strict mode:** `"strict": true` in all tsconfig files
- **No `any`:** Use `unknown` and narrow with type guards
- **Functional components only:** No class components
- **Named exports:** No default exports except for Expo Router pages
- **File naming:** `PascalCase.tsx` for components, `camelCase.ts` for everything else
- **Import order:** React → React Native → third-party → @shared → relative

### Python (ML Backend)
- **Type hints on everything:** All function signatures have full type annotations
- **Pydantic for all request/response models:** No raw dicts crossing API boundaries
- **Black formatter:** Line length 100
- **isort for imports:** Standard library → third-party → local
- **Docstrings:** Every public function has a docstring explaining what it does

### General
- **No console.log / print in production code.** Use structured logging (Sentry for errors, PostHog for analytics events)
- **No hardcoded strings in UI.** All user-facing text goes through a constants file (preparation for future localization)
- **No magic numbers.** Name everything. `const ANALYSIS_POLL_INTERVAL_MS = 1500` not `1500`
- **Components under 200 lines.** If a component exceeds this, break it into sub-components.
- **Hooks under 100 lines.** If a hook exceeds this, split into multiple hooks.

---

## 22. PHASE 1 SCOPE BOUNDARIES

### DO Build
- ✅ Everything in the Screen Specifications (Section 14)
- ✅ 5 reciters, 10 surahs, full audio pipeline
- ✅ Auth with email + Google + Apple
- ✅ Progress tracking with score history and streaks
- ✅ Push notification reminders
- ✅ Pitch contour overlay visualization
- ✅ Polished, production-grade UI/UX

### DO NOT Build
- ❌ Tajweed rule detection
- ❌ Offline mode / on-device inference
- ❌ Social features (sharing, leaderboards, friends)
- ❌ More than 10 surahs or 5 reciters
- ❌ Tablet layouts
- ❌ Multi-language UI
- ❌ Subscription/payment system
- ❌ Custom ML model training (use pre-trained models only)
- ❌ Web version of the app (only the marketing site)

---

## 23. COMMON PITFALLS

1. **iOS audio session switching.** You MUST toggle `allowsRecordingIOS` between recording and playback modes. See Section 6 for exact configuration and Section 16.1 for the centralized audio engine that prevents this. Failure to do this causes audio to route through the earpiece.

2. **Whisper output has no diacritics.** When comparing ASR output to expected text, strip Arabic diacritics from BOTH strings before computing Levenshtein distance. The `text_simple` column in the `ayahs` table stores the stripped version for this purpose.

3. **DTW on raw pitch values is meaningless.** You MUST z-score normalize pitch contours before DTW comparison. Users have different vocal ranges — a woman's F0 might be 200-400Hz while a male reciter's is 100-250Hz. Without normalization, DTW measures absolute pitch difference instead of melodic shape similarity.

4. **expo-av recording format varies by platform.** iOS produces WAV with LPCM encoding. Android may produce different formats depending on the device. The ML backend's preprocessor uses `librosa.load()` which handles most formats, but always verify the actual output format on both platforms early.

5. **Supabase Storage presigned URLs expire.** When generating upload URLs, set a reasonable expiry (5 minutes). For reference audio playback, use the public CDN URL, not presigned URLs.

6. **Arabic text line-breaking.** React Native's default text component handles Arabic shaping correctly, but line-breaking can split words awkwardly. Set `textAlign: 'center'` for the AyahText component and use generous horizontal padding to avoid mid-word breaks.

7. **Recording amplitude ring needs Reanimated.** The 50ms amplitude updates from expo-av must drive a Reanimated shared value, NOT React state. Using `useState` for 20Hz updates will cause frame drops. Always use `useSharedValue` + `useAnimatedStyle`. See Section 15 Tier 3 and Section 16.2 for the full rendering tier rules.

8. **Reference feature vectors must be cached.** Loading a `.npz` file from S3 on every analysis request adds 500ms+ of latency. Load into Redis on first access, cache indefinitely (reference data is immutable).

9. **Score validation before launch is non-negotiable.** The scoring weights (40/30/20/10) are starting estimates. They MUST be validated with real reciters and Tajweed experts. If expert evaluation shows the scores feel arbitrary, adjust the weights and normalization before going live.

10. **Expo Router dynamic routes need error handling.** If `[ayahId].tsx` receives an invalid ID (user navigates directly via deep link), the screen must show a graceful error state, not crash.

11. **Studio state must be a state machine, not scattered booleans.** Never use independent `isRecording`, `isPlaying`, `isUploading` flags. Use the `studioStore` state machine (Section 14 + 15) which enforces valid transitions and prevents impossible states like "playing while recording" or "uploading without a recording." Invalid transitions are no-ops, not crashes.

12. **Never construct raw fetch() calls in screen or hook code.** All network requests go through `core/api/client.ts` (Section 16.3). This ensures consistent auth headers, error normalization, retry logic, and timeout handling. Direct fetch calls bypass all of these and will cause inconsistent error behavior.

13. **Preload reference audio before the user needs it.** If the reference audio isn't buffered when the user enters the Studio screen, there's a visible delay that breaks the flow. Preload from the ayah list screen (Section 16.4). The studio should mount into `ready` state within 500ms.

---

## ENVIRONMENT VARIABLES

### Mobile App (Expo)
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_ML_BACKEND_URL=https://your-ml-service.railway.app
EXPO_PUBLIC_POSTHOG_KEY=your-posthog-key
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### ML Backend
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key  # NOT the anon key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=qiraa-reference-audio
REDIS_URL=redis://your-redis-host:6379
WHISPER_MODEL_SIZE=large-v3
DEVICE=cuda  # or "cpu" for local dev without GPU
SENTRY_DSN=your-sentry-dsn
```

---

*This document is the single source of truth. If it conflicts with any other document, this one wins. Update it as decisions change.*
