import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { getActiveTasks, getUserTasks, startTask, completeTask, Task, UserTask } from '../../src/services/tasks';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';

export default function TasksScreen() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tab, setTab] = useState<'available' | 'mine'>('available');

  const load = async () => {
    if (!profile) return;
    const [active, mine] = await Promise.all([
      getActiveTasks(),
      getUserTasks(profile.id),
    ]);
    setTasks(active);
    setUserTasks(mine);
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleStartTask = async (taskId: string) => {
    if (!profile) return;
    const already = userTasks.find((ut) => ut.taskId === taskId);
    if (already) {
      Alert.alert('שים לב', 'כבר התחלת משימה זו');
      return;
    }
    try {
      await startTask(profile.id, taskId);
      await load();
      setSelectedTask(null);
      Alert.alert('', 'המשימה התחילה! בהצלחה 💪');
    } catch {
      Alert.alert('שגיאה', 'לא ניתן להתחיל את המשימה');
    }
  };

  const handleCompleteTask = async (userTaskId: string) => {
    Alert.alert('סיום משימה', 'האם סיימת את המשימה?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'כן, סיימתי',
        onPress: async () => {
          try {
            await completeTask(userTaskId);
            await load();
            Alert.alert('', 'כל הכבוד! המטבעות הוענקו לחשבונך 🎉');
          } catch {
            Alert.alert('שגיאה', 'לא ניתן לסיים את המשימה');
          }
        },
      },
    ]);
  };

  const statusColor: Record<string, string> = {
    pending: colors.textMuted,
    in_progress: colors.primary,
    completed: colors.warning,
    approved: colors.success,
  };

  const statusLabel: Record<string, string> = {
    pending: 'ממתין',
    in_progress: 'בתהליך',
    completed: 'הושלם',
    approved: 'אושר ✓',
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
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <Text style={styles.headerTitle}>משימות</Text>
        <Text style={styles.headerSub}>{tasks.length} משימות זמינות</Text>

        <View style={styles.tabs}>
          {(['available', 'mine'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'available' ? 'זמינות' : 'שלי'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'available' ? (
          tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>אין משימות זמינות כרגע</Text>
            </View>
          ) : (
            tasks.map((task) => {
              const myTask = userTasks.find((ut) => ut.taskId === task.id);
              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => setSelectedTask(task)}
                  activeOpacity={0.8}
                >
                  <View style={styles.taskTop}>
                    <View style={styles.taskIconBg}>
                      <Ionicons name="flag" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      {task.category && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{task.category}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardText}>+{task.reward}</Text>
                      <Text style={styles.rewardIcon}>🪙</Text>
                    </View>
                  </View>
                  <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>

                  {myTask ? (
                    <View style={[styles.statusBar, { backgroundColor: `${statusColor[myTask.status]}20` }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor[myTask.status] }]} />
                      <Text style={[styles.statusText, { color: statusColor[myTask.status] }]}>
                        {statusLabel[myTask.status]}
                      </Text>
                      {myTask.status === 'in_progress' && (
                        <TouchableOpacity
                          style={styles.completeBtn}
                          onPress={() => handleCompleteTask(myTask.id)}
                        >
                          <Text style={styles.completeBtnText}>סמן כהושלם</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => handleStartTask(task.id)}
                    >
                      <Text style={styles.startBtnText}>התחל משימה</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.textInverse} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )
        ) : (
          userTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={styles.emptyText}>עוד לא התחלת משימות</Text>
            </View>
          ) : (
            userTasks.map((ut) => (
              <View key={ut.id} style={styles.myTaskCard}>
                <View style={styles.myTaskTop}>
                  <Text style={styles.myTaskTitle}>{ut.task?.title || 'משימה'}</Text>
                  <View style={[styles.myStatusBadge, { backgroundColor: `${statusColor[ut.status]}20` }]}>
                    <Text style={[styles.myStatusText, { color: statusColor[ut.status] }]}>
                      {statusLabel[ut.status]}
                    </Text>
                  </View>
                </View>
                {ut.task && (
                  <View style={styles.myTaskReward}>
                    <Text style={styles.myTaskRewardLabel}>פרס: </Text>
                    <Text style={styles.myTaskRewardValue}>+{ut.task.reward} 🪙</Text>
                  </View>
                )}
                {ut.status === 'in_progress' && (
                  <TouchableOpacity
                    style={styles.completeTaskBtn}
                    onPress={() => handleCompleteTask(ut.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                    <Text style={styles.completeTaskBtnText}>סמן כהושלם</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )
        )}
        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Task Detail Modal */}
      <Modal visible={!!selectedTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedTask(null)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            {selectedTask && (
              <>
                <View style={styles.modalIconBg}>
                  <Ionicons name="flag" size={36} color={colors.primary} />
                </View>
                <Text style={styles.modalTitle}>{selectedTask.title}</Text>
                <Text style={styles.modalDesc}>{selectedTask.description}</Text>
                <View style={styles.modalReward}>
                  <Text style={styles.modalRewardLabel}>פרס על השלמה</Text>
                  <Text style={styles.modalRewardValue}>+{selectedTask.reward} 🪙</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalStartBtn}
                  onPress={() => handleStartTask(selectedTask.id)}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.modalBtnGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.modalBtnText}>התחל משימה</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTitle: { ...typography.h2, color: colors.textInverse },
  headerSub: { ...typography.bodySmall, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.md },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.full },
  tabActive: { backgroundColor: colors.surface },
  tabText: { ...typography.label, color: 'rgba(255,255,255,0.8)' },
  tabTextActive: { color: colors.primary },
  scroll: { padding: spacing.lg, flexGrow: 1 },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  taskTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
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
  taskTitle: { ...typography.h4, color: colors.text, marginBottom: 4 },
  categoryBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  categoryText: { ...typography.caption, color: colors.textSecondary },
  rewardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardText: { ...typography.h4, color: colors.gold },
  rewardIcon: { fontSize: 16 },
  taskDesc: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 20 },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...typography.label, flex: 1 },
  completeBtn: {
    backgroundColor: colors.success,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  completeBtnText: { ...typography.caption, color: colors.textInverse, fontWeight: '700' },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  startBtnText: { ...typography.label, color: colors.textInverse },
  myTaskCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  myTaskTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  myTaskTitle: { ...typography.h4, color: colors.text, flex: 1 },
  myStatusBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4, marginLeft: spacing.sm },
  myStatusText: { ...typography.caption, fontWeight: '700' },
  myTaskReward: { flexDirection: 'row', alignItems: 'center' },
  myTaskRewardLabel: { ...typography.bodySmall, color: colors.textMuted },
  myTaskRewardValue: { ...typography.body, color: colors.gold, fontWeight: '700' },
  completeTaskBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  completeTaskBtnText: { ...typography.label, color: colors.success },
  bottomPad: { height: 100 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, marginBottom: spacing.md },
  modalClose: { position: 'absolute', top: spacing.lg, right: spacing.lg },
  modalIconBg: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h3, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  modalDesc: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  modalReward: {
    backgroundColor: `${colors.gold}15`,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  modalRewardLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 4 },
  modalRewardValue: { ...typography.h3, color: colors.gold },
  modalStartBtn: { width: '100%', borderRadius: radius.md, overflow: 'hidden', ...shadows.md },
  modalBtnGrad: { paddingVertical: spacing.md, alignItems: 'center' },
  modalBtnText: { ...typography.h4, color: colors.textInverse },
});
