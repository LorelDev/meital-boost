import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { getActiveTasks, getUserTasks, UserTask, Task } from '../../src/services/tasks';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';

export default function HomeScreen() {
  const { profile, refreshProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!profile) return;
    const [active, mine] = await Promise.all([
      getActiveTasks(),
      getUserTasks(profile.id),
    ]);
    setTasks(active.slice(0, 3));
    setUserTasks(mine.filter((t) => t.status !== 'approved'));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (profile) await refreshProfile(profile.id);
    await load();
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'בוקר טוב';
    if (h < 17) return 'צהריים טובים';
    return 'ערב טוב';
  };

  const completedCount = userTasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{profile?.name || 'מתאמן'}</Text>
            </View>
            <View style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={24} color="rgba(255,255,255,0.9)" />
            </View>
          </View>

          {/* Coins Card */}
          <View style={styles.coinsCard}>
            <View style={styles.coinsLeft}>
              <Text style={styles.coinsLabel}>המטבעות שלי</Text>
              <View style={styles.coinsRow}>
                <Text style={styles.coinsAmount}>{profile?.coins ?? 0}</Text>
                <Text style={styles.coinIcon}>🪙</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.coinsBtn}
              onPress={() => router.push('/(tabs)/coins')}
            >
              <Text style={styles.coinsBtnText}>היסטוריה</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'משימות פעילות', value: userTasks.filter(t => t.status === 'in_progress').length, icon: '⚡', color: colors.warning },
            { label: 'הושלמו', value: completedCount, icon: '✅', color: colors.success },
            { label: 'זמינות', value: tasks.length, icon: '📋', color: colors.primary },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Active Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>משימות זמינות</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
              <Text style={styles.seeAll}>הכל</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>אין משימות חדשות כרגע</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => router.push('/(tabs)/tasks')}
                activeOpacity={0.8}
              >
                <View style={styles.taskLeft}>
                  <View style={styles.taskIconBg}>
                    <Ionicons name="flag-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                    <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
                  </View>
                </View>
                <View style={styles.taskReward}>
                  <Text style={styles.taskRewardText}>+{task.reward}</Text>
                  <Text style={styles.taskRewardIcon}>🪙</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* My Progress */}
        {userTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>המשימות שלי</Text>
            {userTasks.slice(0, 3).map((ut) => (
              <View key={ut.id} style={styles.progressCard}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle} numberOfLines={1}>
                    {ut.task?.title || 'משימה'}
                  </Text>
                  <View style={[styles.statusBadge, styles[`status_${ut.status}`] || styles.status_pending]}>
                    <Text style={styles.statusText}>{statusLabels[ut.status]}</Text>
                  </View>
                </View>
                {ut.task && (
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: ut.status === 'completed' || ut.status === 'approved' ? '100%' : '50%' },
                      ]}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const statusLabels: Record<string, string> = {
  pending: 'ממתין',
  in_progress: 'בתהליך',
  completed: 'הושלם',
  approved: 'אושר',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  avatarBtn: { marginRight: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { ...typography.h4, color: colors.textInverse },
  headerText: { flex: 1 },
  greeting: { ...typography.bodySmall, color: 'rgba(255,255,255,0.8)' },
  userName: { ...typography.h3, color: colors.textInverse },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinsCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  coinsLeft: {},
  coinsLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  coinsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  coinsAmount: { ...typography.h2, color: colors.textInverse },
  coinIcon: { fontSize: 24 },
  coinsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  coinsBtnText: { ...typography.label, color: colors.primary },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { ...typography.h3, marginBottom: 2 },
  statLabel: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h4, color: colors.text },
  seeAll: { ...typography.label, color: colors.primary },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyEmoji: { fontSize: 36, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textMuted },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  taskIconBg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  taskInfo: { flex: 1 },
  taskTitle: { ...typography.h4, color: colors.text, marginBottom: 2 },
  taskDesc: { ...typography.bodySmall, color: colors.textMuted },
  taskReward: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: spacing.sm },
  taskRewardText: { ...typography.h4, color: colors.gold },
  taskRewardIcon: { fontSize: 16 },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  progressTitle: { ...typography.body, color: colors.text, flex: 1 },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginLeft: spacing.sm,
  },
  status_pending: { backgroundColor: `${colors.warning}20` },
  status_in_progress: { backgroundColor: `${colors.primary}20` },
  status_completed: { backgroundColor: `${colors.success}20` },
  status_approved: { backgroundColor: `${colors.success}30` },
  statusText: { ...typography.caption, color: colors.text },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  bottomPad: { height: 100 },
});
