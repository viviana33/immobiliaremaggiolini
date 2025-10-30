import { useMemo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import type { PostImage } from "@shared/schema";
import { Image as ImageIcon } from "lucide-react";

interface PostContentProps {
  content: string;
  images?: PostImage[];
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

const extractYouTubeLinks = (markdown: string): string[] => {
  const youtubeRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  const matches = markdown.match(youtubeRegex);
  return matches || [];
};

export default function PostContent({ content, images = [] }: PostContentProps) {
  const youtubeLinks = useMemo(() => extractYouTubeLinks(content), [content]);
  
  const htmlContent = useMemo(() => {
    if (!content) return "";

    try {
      let processedContent = content;
      
      youtubeLinks.forEach(link => {
        processedContent = processedContent.replace(link, '');
      });

      // Check if content is already HTML (contains HTML tags)
      if (/<[a-z][\s\S]*>/i.test(processedContent)) {
        // Content is already HTML, return it directly
        return processedContent;
      }

      // Content is Markdown, process it
      const result = unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .processSync(processedContent);

      return String(result);
    } catch (error) {
      console.error("Errore nella conversione markdown:", error);
      return "<p>Errore nella conversione del contenuto</p>";
    }
  }, [content, youtubeLinks]);

  const sortedImages = useMemo(() => {
    return [...images]
      .filter(img => !img.isArchived)
      .sort((a, b) => a.position - b.position);
  }, [images]);

  const hasMedia = youtubeLinks.length > 0 || sortedImages.length > 0;

  return (
    <article className="space-y-8">
      {htmlContent && (
        <div 
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-p:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          data-testid="post-content"
        />
      )}

      {youtubeLinks.length > 0 && (
        <div className="space-y-6" data-testid="youtube-embeds">
          {youtubeLinks.map((link, index) => {
            const videoId = extractYouTubeId(link);
            if (!videoId) return null;
            
            return (
              <div key={`youtube-${videoId}-${index}`} className="my-8">
                <YouTubeEmbed 
                  videoUrl={link} 
                  title={`Video ${index + 1}`}
                />
              </div>
            );
          })}
        </div>
      )}

      {sortedImages.length > 0 && (
        <div className="space-y-4" data-testid="post-gallery">
          <h3 className="font-serif font-bold text-2xl text-foreground">
            Galleria Immagini
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedImages.map((image) => (
              <div 
                key={image.id} 
                className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted hover-elevate"
                data-testid={`gallery-image-${image.id}`}
              >
                <img
                  src={image.hotUrl}
                  alt={`Immagine galleria ${image.position + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasMedia && !htmlContent && (
        <div 
          className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
          data-testid="no-content-placeholder"
        >
          <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg">Nessun contenuto disponibile</p>
        </div>
      )}
    </article>
  );
}
