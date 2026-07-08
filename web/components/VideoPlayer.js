function toEmbedUrl(url) {
  if (!url) return null;

  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null; // treat as a direct video file (S3, etc.)
}

export default function VideoPlayer({ videoUrl, title }) {
  const embedUrl = toEmbedUrl(videoUrl);

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-ink/90 rounded-xl flex items-center justify-center text-cream/60">
        No video available
      </div>
    );
  }

  if (embedUrl) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black">
      <video key={videoUrl} controls className="w-full h-full">
        <source src={videoUrl} />
        Your browser doesn't support embedded video.
      </video>
    </div>
  );
}
