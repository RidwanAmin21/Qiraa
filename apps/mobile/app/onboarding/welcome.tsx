import { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, Pattern, Rect, Path, Line } from 'react-native-svg';
import { colors, spacing, radius } from '@/theme';

const EASE_IN_OUT = Easing.inOut(Easing.ease);

// ---------------------------------------------------------------------------
// Mosaic tile geometry
// ---------------------------------------------------------------------------

const TILE = 80;
const HALF = TILE / 2;
const STAR_R = 20;
const STAR_r = 8;
const SPLAY = 10;
const CORNER_R = 7;
const CORNER_r = 3;
const DIAG = Math.round(STAR_R * Math.SQRT1_2);

function starPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number = 8,
): string {
  const n = points * 2;
  const p: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    p.push(
      `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`,
    );
  }
  return p.join(' ') + ' Z';
}

const STAR_D = starPath(HALF, HALF, STAR_R, STAR_r, 8);

const BRIDGE_DS = [
  `M ${HALF + STAR_R},${HALF} L ${TILE},${HALF - SPLAY} L ${TILE},${HALF + SPLAY} Z`,
  `M ${HALF - STAR_R},${HALF} L 0,${HALF - SPLAY} L 0,${HALF + SPLAY} Z`,
  `M ${HALF},${HALF - STAR_R} L ${HALF - SPLAY},0 L ${HALF + SPLAY},0 Z`,
  `M ${HALF},${HALF + STAR_R} L ${HALF - SPLAY},${TILE} L ${HALF + SPLAY},${TILE} Z`,
];

const CORNER_DS = [
  starPath(0, 0, CORNER_R, CORNER_r, 4),
  starPath(TILE, 0, CORNER_R, CORNER_r, 4),
  starPath(0, TILE, CORNER_R, CORNER_r, 4),
  starPath(TILE, TILE, CORNER_R, CORNER_r, 4),
];

const DIAG_LINES: { x1: number; y1: number; x2: number; y2: number }[] = [
  { x1: HALF + DIAG, y1: HALF - DIAG, x2: 70, y2: 10 },
  { x1: HALF + DIAG, y1: HALF + DIAG, x2: 70, y2: 70 },
  { x1: HALF - DIAG, y1: HALF + DIAG, x2: 10, y2: 70 },
  { x1: HALF - DIAG, y1: HALF - DIAG, x2: 10, y2: 10 },
];

const EDGE_LINES: typeof DIAG_LINES = [
  { x1: TILE, y1: CORNER_R, x2: TILE, y2: HALF - SPLAY },
  { x1: TILE, y1: HALF + SPLAY, x2: TILE, y2: TILE - CORNER_R },
  { x1: 0, y1: CORNER_R, x2: 0, y2: HALF - SPLAY },
  { x1: 0, y1: HALF + SPLAY, x2: 0, y2: TILE - CORNER_R },
  { x1: CORNER_R, y1: 0, x2: HALF - SPLAY, y2: 0 },
  { x1: HALF + SPLAY, y1: 0, x2: TILE - CORNER_R, y2: 0 },
  { x1: CORNER_R, y1: TILE, x2: HALF - SPLAY, y2: TILE },
  { x1: HALF + SPLAY, y1: TILE, x2: TILE - CORNER_R, y2: TILE },
];

// ---------------------------------------------------------------------------
// Tiled Islamic mosaic
// ---------------------------------------------------------------------------

function IslamicMosaic({ width, height }: { width: number; height: number }) {
  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern
          id="mosaic"
          width={TILE}
          height={TILE}
          patternUnits="userSpaceOnUse"
        >
          {/* 8-pointed star at tile center */}
          <Path
            d={STAR_D}
            fill={colors.primary[100]}
            fillOpacity={0.18}
            stroke={colors.primary[200]}
            strokeWidth={0.7}
            strokeOpacity={0.28}
          />

          {/* Half-diamond bridges extending to each edge */}
          {BRIDGE_DS.map((d, i) => (
            <Path
              key={`b${i}`}
              d={d}
              fill={colors.primary[100]}
              fillOpacity={0.1}
              stroke={colors.primary[200]}
              strokeWidth={0.5}
              strokeOpacity={0.18}
            />
          ))}

          {/* Small 4-pointed stars at tile corners */}
          {CORNER_DS.map((d, i) => (
            <Path
              key={`c${i}`}
              d={d}
              fill={colors.primary[100]}
              fillOpacity={0.12}
              stroke={colors.primary[200]}
              strokeWidth={0.5}
              strokeOpacity={0.2}
            />
          ))}

          {/* Diagonal spokes from star tips toward corners */}
          {DIAG_LINES.map((l, i) => (
            <Line
              key={`d${i}`}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={colors.primary[200]}
              strokeWidth={0.5}
              strokeOpacity={0.15}
            />
          ))}

          {/* Edge rails connecting bridges to corner stars */}
          {EDGE_LINES.map((l, i) => (
            <Line
              key={`e${i}`}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={colors.primary[200]}
              strokeWidth={0.4}
              strokeOpacity={0.1}
            />
          ))}
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#mosaic)" />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Welcome screen
// ---------------------------------------------------------------------------

export default function WelcomeScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const patternHeight = screenHeight * 0.28;

  const patternOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);
  const bottomOpacity = useSharedValue(0);

  useEffect(() => {
    patternOpacity.value = withTiming(1, {
      duration: 400,
      easing: EASE_IN_OUT,
    });
    contentOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 300, easing: EASE_IN_OUT }),
    );
    contentTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 300, easing: EASE_IN_OUT }),
    );
    bottomOpacity.value = withDelay(
      950,
      withTiming(1, { duration: 300, easing: EASE_IN_OUT }),
    );
  }, []);

  const patternStyle = useAnimatedStyle(() => ({
    opacity: patternOpacity.value,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));
  const bottomStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
  }));

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[styles.patternArea, { height: patternHeight }, patternStyle]}
        >
          <IslamicMosaic width={screenWidth} height={patternHeight} />
          <Text style={styles.bismillah}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </Text>
        </Animated.View>

        <Animated.View style={[styles.nameArea, contentStyle]}>
          <Text style={styles.appName}>Qiraa</Text>
          <Text style={styles.appNameArabic}>قراءة</Text>
          <View style={styles.taglineSpacer} />
          <Text style={styles.tagline}>
            Practice recitation alongside the world's finest reciters
          </Text>
        </Animated.View>

        <Animated.View style={[styles.bottomArea, bottomStyle]}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/onboarding/pick-reciter' as never)}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>

          <Pressable
            style={styles.signInTouchable}
            onPress={() => router.push('/(auth)/login' as never)}
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink}>Sign in</Text>
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDiamond} />
            <View style={styles.dividerLine} />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  safe: {
    flex: 1,
  },

  patternArea: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bismillah: {
    fontFamily: 'Amiri-Regular',
    fontSize: 28,
    lineHeight: 48,
    color: colors.gold[400],
    textAlign: 'center',
    paddingHorizontal: spacing['3xl'],
  },

  nameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    lineHeight: 44,
    color: colors.primary[600],
    textAlign: 'center',
  },
  appNameArabic: {
    fontFamily: 'Amiri-Regular',
    fontSize: 28,
    lineHeight: 40,
    color: colors.primary[400],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  taglineSpacer: {
    height: spacing.lg,
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.neutral[500],
    textAlign: 'center',
    maxWidth: 300,
  },

  bottomArea: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary[500],
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 20,
    color: colors.neutral[0],
  },
  signInTouchable: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  signInText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.neutral[500],
  },
  signInLink: {
    fontFamily: 'Inter-SemiBold',
    color: colors.primary[500],
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing['4xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  dividerDiamond: {
    width: 8,
    height: 8,
    backgroundColor: colors.neutral[200],
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.md,
  },
});
