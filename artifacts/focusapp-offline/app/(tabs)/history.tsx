import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useFocusTimer, FocusSession } from '@/context/FocusContext';
import { formatDate, formatMinutes } from '@/lib/time';

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, clearHistory } = useFocusTimer();
  const confirmClear = () => Alert.alert('Clear history?', 'This removes saved sessions from this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Clear', style: 'destructive', onPress: clearHistory },
  ]);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 18 }]}>
      <View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR LOCAL RECORD</Text><Text style={[styles.title, { color: colors.foreground }]}>History</Text></View>{sessions.length > 0 && <Pressable accessibilityLabel="Clear history" onPress={confirmClear} hitSlop={12}><Feather name="trash-2" size={20} color={colors.mutedForeground} /></Pressable>}</View>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }, sessions.length === 0 && styles.emptyList]}
        scrollEnabled={sessions.length > 0}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <HistoryRow item={item} colors={colors} />}
        ListEmptyComponent={<View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Feather name="clock" size={22} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your first session is waiting</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Complete a focus block and it will stay here, even when you are offline.</Text></View>}
      />
    </View>
  );
}

function HistoryRow({ item, colors }: { item: FocusSession; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.rowIcon, { backgroundColor: item.completed ? colors.secondary : '#3A2B31' }]}><Feather name={item.completed ? 'check' : 'minus'} size={18} color={item.completed ? colors.primary : colors.accent} /></View><View style={styles.rowMain}><Text numberOfLines={1} style={[styles.rowTitle, { color: colors.foreground }]}>{item.label}</Text><Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>{formatDate(item.endedAt)} · {item.completed ? 'Completed' : 'Ended early'}</Text></View><View style={styles.rowTime}><Text style={[styles.rowValue, { color: colors.foreground }]}>{formatMinutes(item.focusSeconds)}</Text><Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>focused</Text></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, marginBottom: 8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 31, letterSpacing: -0.8 },
  list: { gap: 10 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  row: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rowMain: { flex: 1 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  rowMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
  rowTime: { alignItems: 'flex-end' },
  rowValue: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  rowLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 3 },
  emptyCard: { borderWidth: 1, borderRadius: 24, padding: 26, alignItems: 'center' },
  emptyIcon: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8 },
});