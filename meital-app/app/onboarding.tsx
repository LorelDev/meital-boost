import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography } from '../src/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '🎯',
    title: 'קבל משימות',
    subtitle: 'קבל משימות מותאמות אישית ועקוב אחר ההתקדמות שלך בתוכנית האימון',
    bg: [colors.primary, colors.primaryDark] as [string, string],
  },
  {
    id: '2',
    emoji: '🪙',
    title: 'הרוויח מטבעות',
    subtitle: 'השלם משימות, צבור מטבעות ועלה בדירוג התוכנית. כל הישג שווה נקודות!',
    bg: ['#FF6584', '#E8437A'] as [string, string],
  },
  {
    id: '3',
    emoji: '📊',
    title: 'עקוב אחר ההתקדמות',
    subtitle: 'צפה בנתונים שלך, הישגים ורמת ביצוע בזמן אמת',
    bg: ['#43E97B', '#38C86A'] as [string, string],
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const next = () => {
    if (current < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const skip = () => router.replace('/(tabs)/home');

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <LinearGradient colors={item.bg} style={styles.slide}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.85}>
          <Text style={styles.nextText}>
            {current === slides.length - 1 ? 'בוא נתחיל!' : 'הבא'}
          </Text>
        </TouchableOpacity>

        {current < slides.length - 1 && (
          <TouchableOpacity style={styles.skipBtn} onPress={skip}>
            <Text style={styles.skipText}>דלג</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emojiContainer: {
    width: 140,
    height: 140,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emoji: { fontSize: 70 },
  title: {
    ...typography.h1,
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.textInverse,
  },
  nextBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: colors.textInverse,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.md,
  },
  nextText: { ...typography.h4, color: colors.textInverse },
  skipBtn: { padding: spacing.sm },
  skipText: { ...typography.body, color: 'rgba(255,255,255,0.7)' },
});
