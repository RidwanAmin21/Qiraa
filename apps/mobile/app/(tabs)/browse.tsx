import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function BrowseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse</Text>
      <Text style={styles.subtitle}>Surah browser — choose a surah to practice</Text>
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
