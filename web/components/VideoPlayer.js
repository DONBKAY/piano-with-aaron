function getEmbed(url) {
  if (!url) return null;

  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  if (youtubeMatch) {
    const params = "rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&fs=1";
    return {
      src: `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?${params}`,
      provider: "youtube",
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { src: `https://player.vimeo.com/video/${vimeoMatch[1]}`, provider: "vimeo" };
  }

  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (driveMatch) {
    return { src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`, provider: "drive" };
  }

  return null; // treat as a direct video file (S3, etc.)
}

export default function VideoPlayer({ videoUrl, title }) {
  const embed = getEmbed(videoUrl);

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-ink/90 rounded-xl flex items-center justify-center text-cream/60">
        No video available
      </div>
    );
  }

  if (embed) {
   if (embed.provider === "drive") {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        key={embed.src}
        src={embed.src}
        title={title}
        className="absolute inset-0 w-full h-full"
        style={{ border: 0 }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          key={embed.src}
          src={embed.src}
          title={title}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
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
