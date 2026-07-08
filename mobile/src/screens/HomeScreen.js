import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { courseApi } from "../api/course";
import CourseCard from "../components/CourseCard";
import { colors } from "../theme/colors";

const CATEGORIES = [
  { name: "Beginners Corner", blurb: "Start from zero with confidence." },
  { name: "Intermediate Pathway", blurb: "Build technique and musicality." },
  { name: "Advanced Techniques", blurb: "Improvise, syncopate, and impress." },
  { name: "Learning Songs", blurb: "Play the music you actually love." },
];

export default function HomeScreen({ navigation }) {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    courseApi
      .list()
      .then((data) => setFeatured(data.courses.slice(0, 3)))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.kicker}>Piano with Aaron</Text>
      <Text style={styles.hero}>Start Playing Piano Today</Text>
      <Text style={styles.heroSubtitle}>
        Structured, premium video courses that take you from your first note to playing the
        songs you love.
      </Text>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate("Browse")}
      >
        <Text style={styles.ctaText}>Browse courses</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Course Categories</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={styles.categoryCard}
            onPress={() => navigation.navigate("Browse", { category: cat.name })}
          >
            <Text style={styles.categoryTitle}>{cat.name}</Text>
            <Text style={styles.categoryBlurb}>{cat.blurb}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {featured.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Featured Courses</Text>
          {featured.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onPress={() => navigation.navigate("CourseDetail", { slug: c.slug })}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  kicker: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.gold,
    fontWeight: "700",
    textAlign: "center",
  },
  hero: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  heroSubtitle: { textAlign: "center", color: colors.ink, opacity: 0.7, marginBottom: 20 },
  ctaButton: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 32,
  },
  ctaText: { fontWeight: "700", color: colors.ink },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.ink, marginBottom: 12 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 },
  categoryCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  categoryTitle: { fontWeight: "700", color: colors.ink, marginBottom: 4 },
  categoryBlurb: { fontSize: 12, color: colors.ink, opacity: 0.7 },
});
