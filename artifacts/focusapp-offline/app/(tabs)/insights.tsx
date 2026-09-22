import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useFocusTimer } from '@/context/FocusContext';
import { formatMinutes } from '@/lib/time';

export default function InsightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions } = useFocusTimer();
  const stats = useMemo(() => {
    const completed = sessions.filter((session) => session.completed);
    const focusSeconds = sessions.reduce((sum, session) => sum + session.focusSeconds, 0);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const value = sessions.filter((session) => new Date(session.endedAt).toDateString() === date.toDateString()).reduce((sum, session) => sum + session.focusSeconds, 0);
      return { label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2), value };
    });
    return { completed: completed.length, focusSeconds, days, average: completed.length ? Math.round(focusSeconds / completed.length) : 0 };
  }, [sessions]);
  const maxDay = Math.max(...stats.days.map((day) => day.value), 60);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 18 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>A QUIET LOOK BACK</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Insights</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Your patterns, kept private on this device.</Text>
        <View style={styles.statGrid}><Stat label="Total focus" value={formatMinutes(stats.focusSeconds)} colors={colors} /><Stat label="Sessions done" value={String(stats.completed)} colors={colors} /><Stat label="Average block" value={formatMinutes(stats.average)} colors={colors} /></View>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Last 7 days</Text><Feather name="bar-chart-2" size={18} color={colors.primary} /></View>
          <View style={styles.chart}>{stats.days.map((day) => <View key={day.label} style={styles.barColumn}><View style={styles.barTrack}><View style={[styles.bar, { backgroundColor: colors.primary, height: `${Math.max(5, (day.value / maxDay) * 100)}%` }]} /></View><Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{day.label}</Text></View>)}</View>
          {stats.focusSeconds === 0 && <Text style={[styles.chartHint, { color: colors.mutedForeground }]}>Finish a session to see your week take shape.</Text>}
        </View>
        <View style={[styles.tipCard, { backgroundColor: colors.secondary }]}><View style={[styles.tipIcon, { backgroundColor: colors.card }]}><Feather name="compass" size={19} color={colors.accent} /></View><View style={styles.tipCopy}><Text style={[styles.tipTitle, { color: colors.foreground }]}>A useful baseline</Text><Text style={[styles.tipText, { color: colors.mutedForeground }]}>Start with one intentional block a day. Consistency matters more than chasing a perfect streak.</Text></View></View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text></View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, marginBottom: 8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 31, letterSpacing: -0.8 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 7 },
  statGrid: { flexDirection: 'row', gap: 8, marginTop: 24, marginBottom: 12 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 17, padding: 13 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 5 },
  chartCard: { borderWidth: 1, borderRadius: 22, padding: 18, marginTop: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  chart: { height: 180, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, marginTop: 20 },
  barColumn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  barTrack: { width: '100%', maxWidth: 27, height: 135, borderRadius: 8, backgroundColor: '#18343B', justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', minHeight: 7, borderRadius: 8 },
  barLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  chartHint: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center', marginTop: 10 },
  tipCard: { borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, marginTop: 14 },
  tipIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tipCopy: { flex: 1 },
  tipTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  tipText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 4 },
});