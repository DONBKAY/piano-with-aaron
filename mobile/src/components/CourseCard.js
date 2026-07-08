import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function CourseCard({ course, onPress }) {
  const priceLabel = course.currency === "USD" ? `$${course.price}` : `GHS ${course.price}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.thumbnail}>
        {course.thumbnailUrl ? (
          <Image source={{ uri: course.thumbnailUrl }} style={styles.image} />
        ) : (
          <Text style={styles.thumbnailEmoji}>🎹</Text>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.subcategory}>{course.subcategory}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {course.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{priceLabel}</Text>
          {course._count && (
            <Text style={styles.meta}>{course._count.sections} sections</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#FFFFFF80",
  },
  thumbnail: {
    height: 140,
    backgroundColor: colors.goldMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  thumbnailEmoji: { fontSize: 32, opacity: 0.4 },
  body: { padding: 16 },
  subcategory: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.gold,
    fontWeight: "700",
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.ink, marginBottom: 6 },
  description: { fontSize: 13, color: colors.ink, opacity: 0.7, marginBottom: 12 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontWeight: "700", color: colors.ink },
  meta: { fontSize: 12, color: colors.ink, opacity: 0.6 },
});
