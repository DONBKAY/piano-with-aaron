import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { Video, ResizeMode } from "expo-av";

function toEmbedUrl(url) {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

const width = Dimensions.get("window").width;
const height = (width * 9) / 16;

export default function VideoPlayer({ videoUrl }) {
  if (!videoUrl) return null;

  const embedUrl = toEmbedUrl(videoUrl);

  if (embedUrl) {
    return (
      <View style={[styles.container, { width, height }]}>
        <WebView
          source={{ uri: embedUrl }}
          allowsFullscreenVideo
          javaScriptEnabled
          style={{ flex: 1 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Video
        source={{ uri: videoUrl }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#000" },
});
