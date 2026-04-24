import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { getCoinHistory, CoinTransaction } from '../../src/services/coins';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function CoinsScreen() {
  const { profile, refreshProfile } = useAuth();
  const [history, setHistory] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!profile) return;
    const txs = await getCoinHistory(profile.id);
    setHistory(txs);
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (profile) await refreshProfile(profile.id);
    await load();
    setRefreshing(false);
  };

  const totalEarned = history.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent = history.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const formatDate = (ts: any) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return format(d, 'dd MMM, HH:mm', { locale: he });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gold, '#E6A800']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>המטבעות שלי</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceEmoji}>🪙</Text>
          <Text style={styles.balanceAmount}>{profile?.coins ?? 0}</Text>
          <Text style={styles.balanceLabel}>יתרת מטבעות</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="arrow-up-circle" size={20} color={colors.success} />
            <Text style={styles.statValue}>+{totalEarned}</Text>
            <Text style={styles.statLabel}>הרווחת</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="arrow-down-circle" size={20} color={colors.error} />
            <Text style={styles.statValue}>-{totalSpent}</Text>
            <Text style={styles.statLabel}>השתמשת</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{history.length}</Text>
            <Text style={styles.statLabel}>פעולות</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.historyTitle}>היסטוריית פעולות</Text>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏦</Text>
            <Text style={styles.emptyText}>עוד אין פעולות</Text>
            <Text style={styles.emptySubtext}>השלם משימות כדי להרוויח מטבעות!</Text>
          </View>
        ) : (
          history.map((tx) => (
            <View key={tx.id} style={styles.txCard}>
              <View style={[styles.txIconBg, { backgroundColor: tx.amount > 0 ? `${colors.success}15` : `${colors.error}15` }]}>
                <Ionicons
                  name={tx.amount > 0 ? 'arrow-up' : 'arrow-down'}
                  size={20}
                  color={tx.amount > 0 ? colors.success : colors.error}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txReason}>{tx.reason}</Text>
                <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount > 0 ? colors.success : colors.error }]}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} 🪙
              </Text>
            </View>
          ))
        )}
        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTitle: { ...typography.h2, color: colors.textInverse, marginBottom: spacing.lg },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  balanceEmoji: { fontSize: 48, marginBottom: spacing.sm },
  balanceAmount: { fontSize: 52, fontWeight: '800', color: colors.textInverse },
  balanceLabel: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  statValue: { ...typography.h4, color: colors.textInverse },
  statLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)' },
  scroll: { padding: spacing.lg, flexGrow: 1 },
  historyTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.md },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyText: { ...typography.h4, color: colors.textSecondary, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textMuted },
  txCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  txIconBg: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  txInfo: { flex: 1 },
  txReason: { ...typography.body, color: colors.text, marginBottom: 2 },
  txDate: { ...typography.caption, color: colors.textMuted },
  txAmount: { ...typography.h4, fontWeight: '700' },
  bottomPad: { height: 100 },
});
