interface VideoEmbedProps {
  videoUrl: string;
  title?: string;
}

type VideoType = 'youtube' | 'facebook' | 'instagram' | null;

interface VideoInfo {
  type: VideoType;
  embedUrl: string;
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

const extractFacebookVideoUrl = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /facebook\.com\/watch\/?\?v=(\d+)/,
    /facebook\.com\/[^\/]+\/videos\/(\d+)/,
    /fb\.watch\/([a-zA-Z0-9_-]+)/,
    /facebook\.com\/reel\/(\d+)/,
    /facebook\.com\/share\/v\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return url;
    }
  }
  
  return null;
};

const extractInstagramId = (url: string): { type: 'post' | 'reel', id: string } | null => {
  if (!url) return null;
  
  const postPattern = /instagram\.com\/p\/([a-zA-Z0-9_-]+)/;
  const reelPattern = /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/;
  
  let match = url.match(reelPattern);
  if (match && match[1]) {
    return { type: 'reel', id: match[1] };
  }
  
  match = url.match(postPattern);
  if (match && match[1]) {
    return { type: 'post', id: match[1] };
  }
  
  return null;
};

const getVideoInfo = (url: string): VideoInfo | null => {
  if (!url) return null;
  
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    };
  }
  
  const facebookUrl = extractFacebookVideoUrl(url);
  if (facebookUrl) {
    const encodedUrl = encodeURIComponent(facebookUrl);
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560`,
    };
  }
  
  const instagramInfo = extractInstagramId(url);
  if (instagramInfo) {
    return {
      type: 'instagram',
      embedUrl: `https://www.instagram.com/${instagramInfo.type}/${instagramInfo.id}/embed`,
    };
  }
  
  return null;
};

export default function VideoEmbed({ videoUrl, title = "Video immobile" }: VideoEmbedProps) {
  const videoInfo = getVideoInfo(videoUrl);
  
  if (!videoInfo) {
    return null;
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
      <iframe
        src={videoInfo.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
        data-testid={`${videoInfo.type}-embed`}
      />
    </div>
  );
}
