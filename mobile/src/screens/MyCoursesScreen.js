import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { courseApi } from "../api/course";
import CourseCard from "../components/CourseCard";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export default function MyCoursesScreen({ navigation }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    courseApi
      .myEnrolled()
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  useFocusEffect(load);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Log in to see your courses</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Courses</Text>
      {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            You haven't enrolled in any courses yet. Browse the catalog to get started.
          </Text>
        }
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() => navigation.navigate("LessonPlayer", { slug: item.slug })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream, padding: 24 },
  title: { fontSize: 20, fontWeight: "700", color: colors.ink, marginBottom: 16 },
  button: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  buttonText: { fontWeight: "700", color: colors.ink },
  empty: { textAlign: "center", opacity: 0.6, marginTop: 40 },
});
