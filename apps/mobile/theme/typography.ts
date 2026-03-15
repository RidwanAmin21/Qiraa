// theme/typography.ts
export const typography = {
  // Arabic Quranic text — ALWAYS use Amiri
  arabic: {
    family: 'Amiri',
    // Sizes for Quranic text display
    ayahLarge: { fontSize: 32, lineHeight: 56 }, // Studio screen
    ayahMedium: { fontSize: 24, lineHeight: 42 }, // Ayah list
    ayahSmall: { fontSize: 20, lineHeight: 36 }, // Compact views
    bismillah: { fontSize: 28, lineHeight: 48 }, // Bismillah display
  },

  // UI text — ALWAYS use Inter
  ui: {
    family: 'Inter',
    // Scale
    h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
    bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    bodySm: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
    caption: { fontSize: 11, lineHeight: 14, fontWeight: '400' as const },
    label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
    button: { fontSize: 16, lineHeight: 20, fontWeight: '600' as const },
    // Special
    scoreXL: { fontSize: 48, lineHeight: 52, fontWeight: '700' as const }, // Main score display
    scoreLg: { fontSize: 32, lineHeight: 36, fontWeight: '700' as const }, // Dimension scores
  },
} as const;
