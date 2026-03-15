// theme/colors.ts
export const colors = {
  // Primary palette — Islamic-inspired earth tones
  primary: {
    50: '#E8F5EC',
    100: '#C8E6CF',
    200: '#A5D6B0',
    300: '#7DC48E',
    400: '#5CB675',
    500: '#2A9D6E', // Primary action color
    600: '#1B6B4A', // Primary dark — headers, emphasis
    700: '#155A3D',
    800: '#0F4830',
    900: '#0A3622',
  },

  // Gold accent — used sparingly for highlights, achievements, Bismillah
  gold: {
    300: '#E8C96B',
    400: '#D4AF37', // Primary gold
    500: '#C19B2C',
    600: '#A68425',
  },

  // Neutral palette — warm grays, never pure black or pure white
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAF9', // Screen backgrounds
    100: '#F1F4F2', // Card backgrounds
    200: '#E2E8E4', // Borders, dividers
    300: '#C8D0CB', // Disabled states
    400: '#9CA89F', // Placeholder text
    500: '#6B7A6F', // Secondary text
    600: '#4A5A4E', // Body text
    700: '#2E3E32', // Headings
    800: '#1A2A1E', // Primary text
    900: '#0D1610', // Near-black
  },

  // Semantic colors
  success: '#2A9D6E', // Same as primary.500
  warning: '#D4AF37', // Same as gold.400
  error: '#C45B28', // Warm red-orange (not harsh red)
  info: '#3B82B0', // Muted blue

  // Score level colors
  score: {
    beginner: '#C45B28', // Warm orange
    developing: '#D4AF37', // Gold
    proficient: '#5CB675', // Green
    advanced: '#2A9D6E', // Deep green
    master: '#1B6B4A', // Darkest green
  },
} as const;
