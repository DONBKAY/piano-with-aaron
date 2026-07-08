import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { courseApi } from "../api/course";
import { paymentApi } from "../api/lesson";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

function formatDuration(seconds) {
  if (!seconds) return "";
  return `${Math.floor(seconds / 60)} min`;
}

export default function CourseDetailScreen({ route, navigation }) {
  const { slug } = route.params;
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    courseApi
      .getBySlug(slug)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(load, [load]);
  // Re-check enrollment status whenever this screen regains focus
  // (e.g. after returning from a Paystack checkout WebView)
  useFocusEffect(load);

  async function handleEnroll() {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    setEnrolling(true);
    setError("");
    try {
      const { authorizationUrl, reference } = await paymentApi.initialize(data.course.id);
      navigation.navigate("PaymentCheckout", {
        checkoutUrl: authorizationUrl,
        reference,
        courseSlug: slug,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (error && !data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.danger }}>{error}</Text>
      </View>
    );
  }

  const { course, isEnrolled } = data;
  const priceLabel = course.currency === "USD" ? `$${course.price}` : `GHS ${course.price}`;
  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.kicker}>
        {course.category} · {course.subcategory}
      </Text>
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.description}>{course.description}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{priceLabel}</Text>
        <Text style={styles.meta}>
          {course.sections.length} sections · {totalLessons} lessons
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isEnrolled ? (
        <TouchableOpacity
          style={styles.enrollButton}
          onPress={() => navigation.navigate("LessonPlayer", { slug: course.slug })}
        >
          <Text style={styles.enrollButtonText}>Go to lessons</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll} disabled={enrolling}>
          <Text style={styles.enrollButtonText}>
            {enrolling ? "Starting checkout..." : "Enroll now"}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Curriculum</Text>
      {course.sections.map((section) => (
        <View key={section.id} style={styles.sectionBlock}>
          <Text style={styles.sectionName}>{section.title}</Text>
          {section.lessons.map((lesson) => (
            <View key={lesson.id} style={styles.lessonRow}>
              <Text style={styles.lessonTitle}>
                {lesson.locked ? "🔒 " : "▶️ "}
                {lesson.title}
                {lesson.isPreview ? "  (Preview)" : ""}
              </Text>
              <Text style={styles.lessonDuration}>{formatDuration(lesson.durationSec)}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream },
  kicker: { fontSize: 12, color: colors.gold, fontWeight: "700", marginBottom: 6 },
  title: { fontSize: 26, fontWeight: "700", color: colors.ink, marginBottom: 10 },
  description: { color: colors.ink, opacity: 0.75, marginBottom: 16 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  price: { fontSize: 20, fontWeight: "700", color: colors.ink },
  meta: { fontSize: 12, color: colors.ink, opacity: 0.6 },
  enrollButton: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  enrollButtonText: { fontWeight: "700", color: colors.ink },
  error: { color: colors.danger, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.ink, marginBottom: 12 },
  sectionBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  sectionName: {
    backgroundColor: colors.goldMuted,
    padding: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  lessonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lessonTitle: { color: colors.ink, fontSize: 13, flex: 1 },
  lessonDuration: { color: colors.ink, opacity: 0.5, fontSize: 12 },
});
