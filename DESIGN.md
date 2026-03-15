# DESIGN.md — Qiraa Design Principles & Reference

> This file is the design authority for all Qiraa UI code. Claude Code and any contributor
> must follow these rules when creating or modifying components, screens, or styles.
> If something contradicts this file, this file wins.

---

## PRODUCT IDENTITY

Qiraa is a Quran recitation practice app. Users record themselves reciting a verse and
the app scores how closely they match a renowned reciter's style across melody, rhythm,
word accuracy, and vocal dynamics.

**The feeling:** A calm, sacred study space. Like sitting in a quiet mosque with warm
light and clean geometry. Not a game. Not a social app. Not a fitness tracker.

**Design analogues:** Headspace (spacious, intentional), Tarteel (Islamic context),
Libby (warm, bookish) — blended with more warmth and less clinical minimalism.

---

## CORE PRINCIPLES

### 1. Reverence First
This is the Quran. Every screen, animation, interaction, and word of copy treats the
content with dignity. No gamification gimmicks. No confetti. No streaks that feel like
Duolingo guilt trips. Calm, beautiful, respectful.

### 2. Encouragement, Not Judgment
Scores show progress, never punish. Every result screen includes something the user did
well before any suggestion. A score of 30% still gets warmth. The tone is a kind teacher,
never a harsh critic.

### 3. Arabic Text is Sacred
Quranic Arabic always uses Amiri font, always shows full tashkeel (diacritical marks),
always has generous line-height (1.75x minimum), and is NEVER truncated with ellipsis.
If the text doesn't fit, the container scrolls. Arabic text is the centerpiece of any
screen it appears on — UI elements work around it, not the other way around.

### 4. Calm Motion
Animations are subtle and purposeful. Gentle fades, smooth slides, soft pulses. Nothing
that draws attention to itself. The interface should feel like it breathes slowly.

### 5. Progressive Disclosure
Show the most important thing first, reveal detail on interaction. Overall score first,
dimension breakdown on tap, pitch overlay on tap. Never overwhelm with data.

### 6. One-Thumb Reachability
The record button is the most important element. It lives at the bottom of the screen
within natural thumb reach. Primary actions at the bottom, information at the top.

---

## COLOR PALETTE

```
PRIMARY (Islamic-inspired greens)
  50:  #E8F5EC    Background tints, hover states
  100: #C8E6CF    Light fills
  200: #A5D6B0    Secondary fills, reference pitch curve
  300: #7DC48E    Amplitude ring (at 40% opacity)
  400: #5CB675    Proficient score color
  500: #2A9D6E    ← PRIMARY ACTION COLOR (buttons, links, active tabs)
  600: #1B6B4A    Headers, emphasis, master score color
  700: #155A3D    Dark accents
  800: #0F4830    Very dark accents
  900: #0A3622    Deepest green

GOLD (used sparingly)
  300: #E8C96B    Light gold
  400: #D4AF37    ← PRIMARY GOLD (highlights, Bismillah, user pitch curve)
  500: #C19B2C    Dark gold
  600: #A68425    Darkest gold

NEUTRAL (warm grays — never pure black or white)
  0:   #FFFFFF    Card backgrounds, tab bar
  50:  #F8FAF9    ← SCREEN BACKGROUNDS
  100: #F1F4F2    Card backgrounds, input fields
  200: #E2E8E4    Borders, dividers, tab bar top border
  300: #C8D0CB    Disabled states
  400: #9CA89F    Placeholder text, hint text
  500: #6B7A6F    Secondary text
  600: #4A5A4E    Body text
  700: #2E3E32    Headings
  800: #1A2A1E    ← PRIMARY TEXT COLOR
  900: #0D1610    Near-black (use rarely)

SEMANTIC
  success: #2A9D6E  (= primary.500)
  warning: #D4AF37  (= gold.400)
  error:   #C45B28  Warm orange-red. NEVER harsh red (#FF0000).
  info:    #3B82B0  Muted blue

SCORE LEVELS
  beginner:   #C45B28  Warm orange    (0-39%)
  developing: #D4AF37  Gold           (40-59%)
  proficient: #5CB675  Green          (60-79%)
  advanced:   #2A9D6E  Deep green     (80-94%)
  master:     #1B6B4A  Darkest green  (95-100%)
```

### Color Rules
- NEVER use `#000000`. Use `neutral.800` or `neutral.900`.
- NEVER use `#FF0000`. Use `error` (#C45B28).
- NEVER use pure white `#FFFFFF` for screen backgrounds. Use `neutral.50`.
- Gold is an accent — use it for highlights, achievements, Bismillah ornaments, and the
  user's pitch curve. It should never dominate a screen.

---

## TYPOGRAPHY

### Two Families, Never Mixed

**Amiri** — Quranic Arabic text only. Traditional Naskh typeface.
```
ayahLarge:   32px / 56px line-height    Recitation Studio screen
ayahMedium:  24px / 42px line-height    Ayah list items
ayahSmall:   20px / 36px line-height    Compact views
bismillah:   28px / 48px line-height    Bismillah display
```

**Inter** — All UI text (English labels, buttons, scores, navigation).
```
h1:       28px / 36px / Bold (700)      Screen titles
h2:       22px / 28px / SemiBold (600)  Section headers
h3:       18px / 24px / SemiBold (600)  Card titles
bodyLg:   16px / 24px / Regular (400)   Large body text
body:     14px / 20px / Regular (400)   Default body text
bodySm:   12px / 16px / Regular (400)   Small body text
caption:  11px / 14px / Regular (400)   Timestamps, metadata
label:    14px / 20px / Medium (500)    Form labels, tab labels
button:   16px / 20px / SemiBold (600)  Button text
scoreXL:  48px / 52px / Bold (700)      Main score number on Results
scoreLg:  32px / 36px / Bold (700)      Dimension score numbers
```

### Typography Rules
- Arabic Quranic text ALWAYS uses Amiri. No exceptions.
- UI text ALWAYS uses Inter. No exceptions.
- Never mix the two in the same text element.
- Arabic text always has textAlign: 'center' and generous horizontal padding to avoid
  mid-word line breaks.
- Arabic text is never truncated. Never use numberOfLines or ellipsizeMode on Quranic text.

---

## SPACING & RADIUS

```
SPACING
  xs:   4px     Tight gaps (icon-to-label)
  sm:   8px     Small gaps
  md:   12px    Medium gaps
  lg:   16px    Default content padding
  xl:   20px    Section gaps
  2xl:  24px    Large section gaps
  3xl:  32px    Screen section spacing
  4xl:  40px    Major section spacing
  5xl:  48px    Hero spacing
  6xl:  64px    Maximum spacing

BORDER RADIUS
  sm:   8px     Small elements (badges, chips)
  md:   12px    Default (cards, inputs)
  lg:   16px    Large cards
  xl:   20px    Feature cards
  full: 9999px  Circles (buttons, avatars)
```

---

## SHADOWS & DEPTH

Almost flat. The aesthetic is paper-like layers, not floating glass.

- **elevation 1** — Barely perceptible. For subtle separation (tab bar, sticky headers).
- **elevation 2** — Gentle lift. For cards that need to feel tappable.
- **No other elevation levels.** If you think you need a heavier shadow, you don't.
  Solve it with spacing or background color difference instead.

---

## ANIMATION GUIDELINES

| Context                | Duration | Easing              |
|------------------------|----------|---------------------|
| Screen transitions     | 300-400ms| ease-in-out         |
| Micro-interactions     | 150-200ms| ease-out            |
| Score ring fill        | 1200ms   | ease-in-out         |
| Score number count-up  | 1200ms   | linear              |
| Score label fade-in    | 200ms    | ease-in (200ms delay after ring)|
| Record button pulse    | 1500ms   | ease-in-out (loop)  |
| Amplitude ring         | spring   | damping: 15, stiffness: 150 |
| Skeleton shimmer       | 1500ms   | linear (loop)       |

### Animation Rules
- NEVER use bounce or overshoot easing.
- NEVER animate more than two properties simultaneously on the same element.
- The amplitude ring is driven by a Reanimated shared value, NEVER React state.
  (50ms updates to useState will cause frame drops.)
- Loading states are never spinners. Use skeleton placeholders for data loading.
  Use rotating status messages for the analysis wait.

---

## ICON SYSTEM

- **Library:** Lucide React Native (`lucide-react-native`)
- **Default size:** 24px
- **Active state:** Filled variant
- **Inactive state:** Outline variant
- **Color:** Inherits from parent (typically `primary.500` for active, `neutral.400` for inactive)
- NEVER mix icon libraries. No FontAwesome, no Material Icons, no Ionicons.

---

## COMPONENT SPECIFICATIONS

### RecordButton
- Size: 80x80px
- Idle: `primary.500` circle, white mic icon (32px)
- Recording: gentle pulse (scale 1.0 → 1.05 → 1.0, 1.5s loop), surrounded by AmplitudeRing
- AmplitudeRing: `primary.300` at 40% opacity, radius 44px (silence) to 64px (loud)
- Haptics: medium impact on start, light impact on stop
- This is the most important interactive element in the app. Give it breathing room.

### ProgressRing (Score Display)
- Size: 160x160px on Results screen
- Animated SVG circle, fills clockwise over 1.2s
- Stroke color = score level color
- Score number counts up from 0 in sync with ring
- Label fades in 200ms after ring completes
- Score levels: 0-39% Beginning, 40-59% Developing, 60-79% Proficient, 80-94% Advanced, 95-100% Master

### PitchOverlay
- Built with @shopify/react-native-skia
- Height: 200px
- Reference curve: `primary.200`, 2px stroke
- User curve: `gold.400`, 2.5px stroke
- Divergent regions: `error` at 10% opacity background band
- Time markers every 1 second on x-axis
- Horizontally scrollable (100px per second)
- Tappable: tap a point to hear 1.5s clip from that moment

### AyahText
- Font: Amiri, always
- Full tashkeel, always
- textAlign: center, always
- Generous horizontal padding (minimum 24px each side)
- NEVER truncated. Container scrolls if needed.
- Line-height: 1.75x minimum

### FeedbackCard
- Structure: "[Positive observation]. [Specific actionable suggestion]."
- Tone: warm, encouraging, specific
- GOOD: "Your melody is coming along nicely — try listening to how Al-Afasy shapes the end of each phrase."
- BAD: "Analysis complete. Score: 65%. Areas for improvement: melody."
- BAD: "Great job! Keep it up!" (too generic)

### SurahCard
- Arabic name (Amiri), English name (Inter), ayah count, difficulty badge
- Difficulty badges: beginner = green tint, intermediate = gold tint, advanced = warm orange tint

### Skeleton Placeholder
- Background: `neutral.200`
- Shimmer: `neutral.100` highlight sweeping left to right, 1.5s loop
- Match the exact shape of the content being loaded (text lines, cards, images)

---

## SCREEN LAYOUT PATTERNS

### Tab Bar
- 4 tabs: Home, Browse, Progress, Settings
- Background: `neutral.0` (white)
- Top border: 1px `neutral.200`
- Active icon: filled, `primary.500`
- Active label: `primary.500`
- Inactive icon: outline, `neutral.400`
- Inactive label: `neutral.400`

### Screen Headers
- Back button (left), title (center), optional action (right)
- Background: transparent (blends with screen background)
- Title: Inter h3, `neutral.700`

### Content Areas
- Screen background: `neutral.50`
- Content padding: `lg` (16px) horizontal
- Section spacing: `3xl` (32px) vertical

---

## WRITING STYLE FOR UI COPY

- Warm, not clinical. "Listen to the reference" not "Play reference audio file."
- Encouraging, not commanding. "Try again" not "Retry recording."
- Specific, not generic. "Your rhythm matched Al-Husary's pacing closely" not "Good job."
- Brief. Labels are 1-3 words. Descriptions are 1 sentence. Feedback is 2 sentences max.
- No exclamation marks in scores or results. Reserve them for genuine celebration (streaks, milestones).
- No technical jargon. "Melody" not "pitch contour." "Rhythm" not "word duration ratios."
- This is the Quran — no slang, no casualness, no humor in contexts where ayah text is displayed.

---

## WHAT NOT TO DO

- ❌ Gamification: no XP, no coins, no levels, no leaderboards, no "streaks lost" guilt
- ❌ Harsh colors: no pure black, no pure red, no neon anything
- ❌ Heavy shadows or glassmorphism
- ❌ Bounce animations or playful motion
- ❌ Truncating Arabic text with ellipsis
- ❌ Spinners for loading states
- ❌ Multiple icon libraries
- ❌ Dense data views without progressive disclosure
- ❌ Microphone icon that looks like a karaoke or podcast app
- ❌ Any copy that feels like judgment ("You failed", "Poor score", "Try harder")
- ❌ Social comparison features (leaderboards, sharing scores publicly)

---

## FILE REFERENCE

When implementing, import from these paths:

```typescript
// Theme tokens
import { colors, typography, spacing, radius } from '@/theme';

// Shared types and constants
import { SURAHS, RECITERS } from '@qiraa/shared';
import { getScoreLevel, getScoreLabel, getScorePercentage } from '@qiraa/shared';
import type { Surah, Ayah, Reciter, AnalysisResult } from '@qiraa/shared';
```

---

*This document is the design authority. When in doubt, default to calm, warm, and respectful.*
