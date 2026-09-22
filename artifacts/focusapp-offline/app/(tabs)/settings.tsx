import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useFocusTimer } from '@/context/FocusContext';

const focusOptions = [15, 25, 45, 60, 90];
const breakOptions = [3, 5, 10, 15];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, active, sessions, updateSettings, clearHistory } = useFocusTimer();
  const reset = () => Alert.alert('Reset local data?', 'This clears your saved history and restores the default timer settings.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Reset', style: 'destructive', onPress: () => { clearHistory(); updateSettings({ focusMinutes: 25, breakMinutes: 5, hardFocus: false, soundEnabled: true }); } },
  ]);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 18 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR PREFERENCES</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Simple controls, stored locally.</Text>
        <SectionTitle title="Timer" colors={colors} />
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <OptionRow label="Focus length" value={`${settings.focusMinutes} minutes`} colors={colors} />
          <View style={styles.chips}>{focusOptions.map((value) => <Choice key={value} value={`${value}`} selected={settings.focusMinutes === value} disabled={Boolean(active)} onPress={() => updateSettings({ focusMinutes: value })} colors={colors} />)}</View>
          <OptionRow label="Break length" value={`${settings.breakMinutes} minutes`} colors={colors} />
          <View style={styles.chips}>{breakOptions.map((value) => <Choice key={value} value={`${value}`} selected={settings.breakMinutes === value} disabled={Boolean(active)} onPress={() => updateSettings({ breakMinutes: value })} colors={colors} />)}</View>
        </View>
        <SectionTitle title="Focus guardrails" colors={colors} />
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow icon="shield" label="Hard focus" detail="Lock pause and skip during focus phases." value={settings.hardFocus} onChange={(value) => updateSettings({ hardFocus: value })} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ToggleRow icon="volume-2" label="Completion sound" detail="Keep a small haptic cue when a phase ends." value={settings.soundEnabled} onChange={(value) => updateSettings({ soundEnabled: value })} colors={colors} />
        </View>
        <SectionTitle title="Storage" colors={colors} />
        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.storageRow}><View style={[styles.storageIcon, { backgroundColor: colors.secondary }]}><Feather name="database" size={18} color={colors.primary} /></View><View style={styles.storageCopy}><Text style={[styles.storageTitle, { color: colors.foreground }]}>On-device only</Text><Text style={[styles.storageText, { color: colors.mutedForeground }]}>{sessions.length} saved session{sessions.length === 1 ? '' : 's'} · nothing leaves this phone</Text></View></View>
          <Pressable testID="reset-local-data" onPress={reset} style={({ pressed }) => [styles.resetButton, { borderColor: colors.destructive, opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.resetText, { color: colors.destructive }]}>Reset local data</Text></Pressable>
        </View>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>FocusApp Offline · built for quiet progress</Text>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title, colors }: { title: string; colors: ReturnType<typeof useColors> }) { return <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>; }
function OptionRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) { return <View style={styles.optionRow}><Text style={[styles.optionLabel, { color: colors.foreground }]}>{label}</Text><Text style={[styles.optionValue, { color: colors.mutedForeground }]}>{value}</Text></View>; }
function Choice({ value, selected, disabled, onPress, colors }: { value: string; selected: boolean; disabled: boolean; onPress: () => void; colors: ReturnType<typeof useColors> }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.choice, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.secondary, opacity: disabled ? 0.5 : 1 }]}><Text style={[styles.choiceText, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>{value}</Text></Pressable>; }
function ToggleRow({ icon, label, detail, value, onChange, colors }: { icon: keyof typeof Feather.glyphMap; label: string; detail: string; value: boolean; onChange: (value: boolean) => void; colors: ReturnType<typeof useColors> }) { return <View style={styles.toggleRow}><View style={[styles.toggleIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={17} color={colors.primary} /></View><View style={styles.toggleCopy}><Text style={[styles.toggleLabel, { color: colors.foreground }]}>{label}</Text><Text style={[styles.toggleDetail, { color: colors.mutedForeground }]}>{detail}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={value ? colors.primaryForeground : colors.mutedForeground} /></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, marginBottom: 8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 31, letterSpacing: -0.8 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 7, marginBottom: 28 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, marginBottom: 10, marginTop: 6 },
  group: { borderRadius: 20, borderWidth: 1, padding: 15, marginBottom: 18 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  optionValue: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  chips: { flexDirection: 'row', gap: 7, marginTop: 12, marginBottom: 18 },
  choice: { flex: 1, minHeight: 37, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  choiceText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 53 },
  toggleIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggleCopy: { flex: 1 },
  toggleLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  toggleDetail: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: 3 },
  divider: { height: 1, marginVertical: 10 },
  storageRow: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  storageIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  storageCopy: { flex: 1 },
  storageTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  storageText: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  resetButton: { minHeight: 44, borderRadius: 13, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  resetText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  version: { textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
});