import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, typography } from '../theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.neutral[0] },
          headerTintColor: colors.neutral[800],
          headerTitleStyle: {
            fontSize: typography.ui.h2.fontSize,
            fontWeight: typography.ui.h2.fontWeight,
          },
          contentStyle: { backgroundColor: colors.neutral[50] },
          headerShadowVisible: false,
          headerBorderBottomWidth: 1,
          headerBorderBottomColor: colors.neutral[200],
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}