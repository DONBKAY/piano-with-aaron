import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { courseApi } from "../api/course";
import { lessonApi } from "../api/lesson";
import VideoPlayer from "../components/VideoPlayer";
import { colors } from "../theme/colors";

function flattenLessons(course) {
  const flat = [];
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      flat.push({ ...lesson, sectionTitle: section.title });
    }
  }
  return flat;
}

export default function LessonPlayerScreen({ route, navigation }) {
  const { slug } = route.params;
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolled, setEnrolled] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState(route.params.lessonId || null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marking, setMarking] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    courseApi
      .getForLearning(slug)
      .then((data) => {
        setCourse(data.course);
        setEnrolled(data.enrolled);
        setProgress(data.progress || null);
        if (data.enrolled) {
          const flat = flattenLessons(data.course);
          const initial =
            flat.find((l) => l.id === activeLessonId) ||
            flat.find((l) => !l.completed) ||
            flat[0];
          if (initial) setActiveLessonId(initial.id);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(load, [load]);

  const flatLessons = useMemo(() => (course ? flattenLessons(course) : []), [course]);
  const activeLesson = flatLessons.find((l) => l.id === activeLessonId);
  const activeIndex = flatLessons.findIndex((l) => l.id === activeLessonId);

  async function handleMarkComplete() {
    if (!activeLesson) return;
    setMarking(true);
    try {
      await lessonApi.complete(activeLesson.id);
      const data = await courseApi.getForLearning(slug);
      setCourse(data.course);
      setProgress(data.progress);
    } catch (err) {
      setError(err.message);
    } finally {
      setMarking(false);
    }
  }

  function goTo(offset) {
    const target = flatLessons[activeIndex + offset];
    if (target) setActiveLessonId(target.id);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.danger }}>{error}</Text>
      </View>
    );
  }
  if (enrolled === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Not enrolled yet</Text>
        <Text style={styles.message}>Enroll to unlock the full lesson player.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CourseDetail", { slug })}
        >
          <Text style={styles.buttonText}>View course</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.courseTitle} numberOfLines={1}>
          {course.title}
        </Text>
        <TouchableOpacity onPress={() => setSidebarOpen(true)}>
          <Text style={styles.curriculumLink}>Curriculum ☰</Text>
        </TouchableOpacity>
      </View>

      {progress && (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {progress.completed}/{progress.total} · {progress.percent}%
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {activeLesson ? (
          <>
            <VideoPlayer videoUrl={activeLesson.videoUrl} />

            <Text style={styles.sectionKicker}>{activeLesson.sectionTitle}</Text>
            <Text style={styles.lessonTitle}>{activeLesson.title}</Text>

            <TouchableOpacity
              style={[styles.completeButton, activeLesson.completed && styles.completeButtonDone]}
              onPress={handleMarkComplete}
              disabled={marking || activeLesson.completed}
            >
              <Text style={styles.completeButtonText}>
                {activeLesson.completed
                  ? "Completed ✅"
                  : marking
                  ? "Saving..."
                  : "Mark as complete"}
              </Text>
            </TouchableOpacity>

            <View style={styles.navRow}>
              <TouchableOpacity
                onPress={() => goTo(-1)}
                disabled={activeIndex <= 0}
                style={[styles.navButton, activeIndex <= 0 && styles.navButtonDisabled]}
              >
                <Text style={styles.navButtonText}>← Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => goTo(1)}
                disabled={activeIndex >= flatLessons.length - 1}
                style={[
                  styles.navButton,
                  activeIndex >= flatLessons.length - 1 && styles.navButtonDisabled,
                ]}
              >
                <Text style={styles.navButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.message}>Select a lesson to begin.</Text>
        )}
      </ScrollView>

      <Modal visible={sidebarOpen} animationType="slide" onRequestClose={() => setSidebarOpen(false)}>
        <View style={styles.sidebarModal}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Curriculum</Text>
            <TouchableOpacity onPress={() => setSidebarOpen(false)}>
              <Text style={styles.sidebarClose}>Close ✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {course.sections.map((section) => (
              <View key={section.id}>
                <Text style={styles.sidebarSectionTitle}>{section.title}</Text>
                {section.lessons.map((lesson) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.sidebarLesson,
                      lesson.id === activeLessonId && styles.sidebarLessonActive,
                    ]}
                    onPress={() => {
                      setActiveLessonId(lesson.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Text style={styles.sidebarLessonText}>
                      {lesson.completed ? "✅ " : "▶️ "}
                      {lesson.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
    padding: 24,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  courseTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, flex: 1, marginRight: 8 },
  curriculumLink: { color: colors.gold, fontWeight: "600" },
  progressRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.goldMuted, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.gold },
  progressText: { fontSize: 11, color: colors.ink, opacity: 0.6 },
  sectionKicker: { fontSize: 12, color: colors.gold, fontWeight: "700", marginTop: 16 },
  lessonTitle: { fontSize: 22, fontWeight: "700", color: colors.ink, marginBottom: 16 },
  completeButton: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  completeButtonDone: { opacity: 0.6 },
  completeButtonText: { fontWeight: "700", color: colors.ink },
  navRow: { flexDirection: "row", justifyContent: "space-between" },
  navButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  navButtonDisabled: { opacity: 0.3 },
  navButtonText: { color: colors.ink, fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "700", color: colors.ink, marginBottom: 8 },
  message: { color: colors.ink, opacity: 0.7, textAlign: "center", marginBottom: 16 },
  button: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20 },
  buttonText: { fontWeight: "700", color: colors.ink },
  sidebarModal: { flex: 1, backgroundColor: colors.cream, paddingTop: 60 },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sidebarTitle: { fontSize: 20, fontWeight: "700", color: colors.ink },
  sidebarClose: { color: colors.gold, fontWeight: "600" },
  sidebarSectionTitle: {
    backgroundColor: colors.goldMuted,
    padding: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  sidebarLesson: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  sidebarLessonActive: { backgroundColor: colors.goldMuted },
  sidebarLessonText: { color: colors.ink, fontSize: 14 },
});
