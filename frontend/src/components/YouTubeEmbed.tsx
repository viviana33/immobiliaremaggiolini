interface YouTubeEmbedProps {
  videoUrl: string;
  title?: string;
}

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

export default function YouTubeEmbed({ videoUrl, title = "Video immobile" }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(videoUrl);
  
  if (!videoId) {
    return null;
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        data-testid="youtube-embed"
      />
    </div>
  );
}
