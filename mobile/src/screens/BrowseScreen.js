import { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { courseApi } from "../api/course";
import CourseCard from "../components/CourseCard";
import { colors } from "../theme/colors";

const CATEGORIES = [
  "Beginners Corner",
  "Intermediate Pathway",
  "Advanced Techniques",
  "Learning Songs",
];

export default function BrowseScreen({ navigation, route }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(route.params?.category || "");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    courseApi
      .list(params)
      .then((data) => setCourses(data.courses))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Course Catalog</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search courses..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.chip, !category && styles.chipActive]}
          onPress={() => setCategory("")}
        >
          <Text style={[styles.chipText, !category && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Text style={styles.empty}>Loading courses...</Text>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={<Text style={styles.empty}>No courses match your filters.</Text>}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() => navigation.navigate("CourseDetail", { slug: item.slug })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: 20 },
  title: { fontSize: 26, fontWeight: "700", color: colors.ink, marginBottom: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontSize: 12, color: colors.ink },
  chipTextActive: { color: colors.ink, fontWeight: "700" },
  empty: { textAlign: "center", opacity: 0.6, marginTop: 40 },
});
