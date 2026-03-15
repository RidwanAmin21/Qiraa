import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      <Text style={styles.subtitle}>Your stats and recitation history</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    padding: spacing.lg,
  },
  title: {
    ...typography.ui.h1,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.ui.body,
    color: colors.neutral[500],
  },
});
