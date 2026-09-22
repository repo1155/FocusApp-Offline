import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useFocusTimer } from '@/context/FocusContext';
import { formatMinutes, formatTimer } from '@/lib/time';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    active,
    settings,
    hydrated,
    elapsedSeconds,
    remainingSeconds,
    todaySeconds,
    startTimer,
    pauseTimer,
    resumeTimer,
    skipPhase,
  } = useFocusTimer();
  const [label, setLabel] = useState('');
  const progress = active
    ? Math.min(
        1,
        elapsedSeconds /
          ((active.mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60),
      )
    : 0;
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  }, []);

  if (!hydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading your local space…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 112 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              LOCAL MODE · ALWAYS AVAILABLE
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>{greeting},</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              protect your attention.
            </Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
        </View>

        <View style={[styles.todayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>TODAY&apos;S FOCUS</Text>
            <Text style={[styles.todayValue, { color: colors.foreground }]}>
              {formatMinutes(todaySeconds)}
            </Text>
          </View>
          <View style={[styles.todayIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="sun" size={20} color={colors.primary} />
          </View>
        </View>

        <View style={[styles.timerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.timerHeader}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
                {active
                  ? active.mode === 'focus'
                    ? 'FOCUS SESSION'
                    : 'RECOVERY BREAK'
                  : 'READY WHEN YOU ARE'}
              </Text>
              <Text style={[styles.sessionName, { color: colors.foreground }]}>
                {active?.label ?? 'A clear mind starts here'}
              </Text>
            </View>
            {active && (
              <View
                style={[
                  styles.modePill,
                  { backgroundColor: active.mode === 'focus' ? colors.primary : colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.modePillText,
                    {
                      color:
                        active.mode === 'focus'
                          ? colors.primaryForeground
                          : colors.accentForeground,
                    },
                  ]}
                >
                  {active.mode === 'focus' ? 'FOCUS' : 'BREAK'}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.timerRing, { borderColor: colors.border }]}>
            <View
              style={[
                styles.progressArc,
                {
                  borderColor: active?.mode === 'focus' ? colors.primary : colors.accent,
                  transform: [{ rotate: `${-45 + progress * 360}deg` }],
                },
              ]}
            />
            <Text style={[styles.timerText, { color: colors.foreground }]}>
              {active ? formatTimer(remainingSeconds) : formatTimer(settings.focusMinutes * 60)}
            </Text>
            <Text style={[styles.timerSubtext, { color: colors.mutedForeground }]}>
              {active ? (active.paused ? 'paused' : 'remaining') : `${settings.focusMinutes} minute focus`}
            </Text>
          </View>

          {!active && (
            <TextInput
              testID="session-label-input"
              value={label}
              onChangeText={setLabel}
              placeholder="What are you working on?"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary },
              ]}
              maxLength={52}
            />
          )}

          <View style={styles.actionRow}>
            {!active ? (
              <Pressable
                testID="start-timer"
                onPress={() => startTimer(label)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 },
                ]}
              >
                <Feather name="play" size={18} color={colors.primaryForeground} />
                <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                  Start focus
                </Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  testID="pause-resume"
                  onPress={() => (active.paused ? resumeTimer() : pauseTimer())}
                  disabled={settings.hardFocus && active.mode === 'focus'}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor: colors.primary,
                      opacity:
                        pressed ? 0.82 : settings.hardFocus && active.mode === 'focus' ? 0.5 : 1,
                    },
                  ]}
                >
                  <Feather
                    name={active.paused ? 'play' : 'pause'}
                    size={18}
                    color={colors.primaryForeground}
                  />
                  <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                    {active.paused ? 'Resume' : 'Pause'}
                  </Text>
                </Pressable>
                <Pressable
                  testID="skip-phase"
                  onPress={skipPhase}
                  disabled={settings.hardFocus && active.mode === 'focus'}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    {
                      borderColor: colors.border,
                      opacity:
                        pressed ? 0.65 : settings.hardFocus && active.mode === 'focus' ? 0.45 : 1,
                    },
                  ]}
                >
                  <Feather name="skip-forward" size={18} color={colors.foreground} />
                  <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>Skip</Text>
                </Pressable>
              </>
            )}
          </View>
          {active && settings.hardFocus && active.mode === 'focus' && (
            <Text style={[styles.helper, { color: colors.mutedForeground }]}>
              Hard focus is on. Pause and skip are locked until this phase ends.
            </Text>
          )}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your rhythm</Text>
          <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
            {settings.focusMinutes} / {settings.breakMinutes} min
          </Text>
        </View>
        <View style={styles.rhythmRow}>
          <View style={[styles.rhythmItem, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.rhythmNumber, { color: colors.primary }]}>{active?.cycle ?? 0}</Text>
            <Text style={[styles.rhythmLabel, { color: colors.mutedForeground }]}>cycles today</Text>
          </View>
          <View style={[styles.rhythmItem, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.rhythmNumber, { color: colors.accent }]}>
              {settings.hardFocus ? 'ON' : 'OFF'}
            </Text>
            <Text style={[styles.rhythmLabel, { color: colors.mutedForeground }]}>hard focus</Text>
          </View>
        </View>
        <Pressable onPress={() => Haptics.selectionAsync()} style={styles.offlineNote}>
          <Feather name="wifi-off" size={15} color={colors.mutedForeground} />
          <Text style={[styles.offlineText, { color: colors.mutedForeground }]}>
            Everything is saved on this device. No account, no sync, no network.
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 18 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Inter_500Medium', fontSize: 15 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, marginBottom: 8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 33, letterSpacing: -0.7 },
  statusDot: { width: 11, height: 11, borderRadius: 6, marginTop: 8 },
  todayCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.1 },
  todayValue: { fontFamily: 'Inter_700Bold', fontSize: 25, marginTop: 5 },
  todayIcon: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  timerCard: { borderWidth: 1, borderRadius: 26, padding: 20, alignItems: 'center' },
  timerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 5, maxWidth: 235 },
  modePill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  modePillText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8 },
  timerRing: {
    width: 218,
    height: 218,
    borderRadius: 109,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 22,
    position: 'relative',
  },
  progressArc: {
    position: 'absolute',
    width: 198,
    height: 198,
    borderRadius: 99,
    borderWidth: 6,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerText: { fontFamily: 'Inter_700Bold', fontSize: 44, letterSpacing: -1.5 },
  timerSubtext: { fontFamily: 'Inter_500Medium', fontSize: 13, marginTop: 2 },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  actionRow: { width: '100%', flexDirection: 'row', gap: 10 },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  primaryButtonText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  secondaryButton: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center', lineHeight: 17, marginTop: 12 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 3 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  sectionHint: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  rhythmRow: { flexDirection: 'row', gap: 12 },
  rhythmItem: { flex: 1, borderRadius: 18, padding: 16 },
  rhythmNumber: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  rhythmLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 3 },
  offlineNote: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 3 },
  offlineText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
});
