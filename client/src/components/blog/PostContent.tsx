import { useMemo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeParse from "rehype-parse";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import VideoEmbed from "@/components/VideoEmbed";
import type { PostImage } from "@shared/schema";
import { Image as ImageIcon } from "lucide-react";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

interface PostContentProps {
  content: string;
  images?: PostImage[];
}

// Rehype plugin to sanitize CSS in style attributes
// Allows only safe CSS properties and blocks url() to prevent data: URI attacks
function rehypeSanitizeCSS() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.properties && node.properties.style) {
        const style = String(node.properties.style);
        
        // Parse CSS properties
        const properties = style.split(';').map(p => p.trim()).filter(Boolean);
        const safeProperties: string[] = [];
        
        // Whitelist of safe CSS properties with safe value patterns
        const SAFE_PATTERNS = {
          'color': /^(#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-z]+)$/i,
          'background-color': /^(#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|transparent|[a-z]+)$/i,
          'text-align': /^(left|center|right|justify|start|end)$/i,
        };
        
        for (const prop of properties) {
          const [name, ...valueParts] = prop.split(':');
          const propName = name.trim().toLowerCase();
          const propValue = valueParts.join(':').trim();
          
          // Check if property is in whitelist
          if (propName in SAFE_PATTERNS) {
            // Check if value matches safe pattern
            const pattern = SAFE_PATTERNS[propName as keyof typeof SAFE_PATTERNS];
            
            // Block any value containing url( or data:
            if (propValue.includes('url(') || propValue.includes('data:')) {
              continue; // Skip this property
            }
            
            if (pattern.test(propValue)) {
              safeProperties.push(`${propName}: ${propValue}`);
            }
          }
        }
        
        // Update style with only safe properties, or remove if empty
        if (safeProperties.length > 0) {
          node.properties.style = safeProperties.join('; ');
        } else {
          delete node.properties.style;
        }
      }
    });
  };
}

const extractVideoLinks = (markdown: string): string[] => {
  const videoRegexes = [
    /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,
    /https?:\/\/(?:www\.)?facebook\.com\/watch\/?\?v=\d+/g,
    /https?:\/\/(?:www\.)?facebook\.com\/[^\/]+\/videos\/\d+/g,
    /https?:\/\/(?:www\.)?fb\.watch\/[a-zA-Z0-9_-]+/g,
    /https?:\/\/(?:www\.)?facebook\.com\/reel\/\d+/g,
    /https?:\/\/(?:www\.)?facebook\.com\/share\/v\/[a-zA-Z0-9_-]+/g,
    /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/[a-zA-Z0-9_-]+/g,
  ];
  
  const links: string[] = [];
  
  for (const regex of videoRegexes) {
    const matches = markdown.match(regex);
    if (matches) {
      links.push(...matches);
    }
  }
  
  return links;
};

export default function PostContent({ content, images = [] }: PostContentProps) {
  const videoLinks = useMemo(() => extractVideoLinks(content), [content]);
  
  const htmlContent = useMemo(() => {
    if (!content) return "";

    try {
      let processedContent = content;
      
      videoLinks.forEach(link => {
        processedContent = processedContent.replace(link, '');
      });

      // Check if content is HTML (from Tiptap editor) or Markdown
      const isHTML = /<[a-z][\s\S]*>/i.test(processedContent);
      
      if (isHTML) {
        // Content is HTML from Tiptap - merge with defaultSchema for security
        // defaultSchema blocks dangerous tags (script) and attributes (onclick, onerror)
        // We add only safe formatting attributes needed by Tiptap
        const tiptapSchema = {
          ...defaultSchema,
          tagNames: [
            ...(defaultSchema.tagNames || []),
            'mark',  // For highlights
            'u',     // For underline
            's',     // For strikethrough
          ],
          attributes: {
            ...defaultSchema.attributes,
            // Add style only to elements that need it for Tiptap formatting
            span: [
              ...(defaultSchema.attributes?.span || []),
              'style',  // For text color
            ],
            mark: [
              ...(defaultSchema.attributes?.mark || []),
              'style',  // For highlight background-color
            ],
            p: [
              ...(defaultSchema.attributes?.p || []),
              'style',  // For text-align
            ],
            h1: [
              ...(defaultSchema.attributes?.h1 || []),
              'style',  // For text-align, color
            ],
            h2: [
              ...(defaultSchema.attributes?.h2 || []),
              'style',
            ],
            h3: [
              ...(defaultSchema.attributes?.h3 || []),
              'style',
            ],
            // Strong, em, u, s, code don't need style - they're semantic
            // Lists already have style from default
            // Blockquotes, links use default attributes
          },
          // Security: Restrict image URLs to http/https only (block data: URIs)
          protocols: {
            ...defaultSchema.protocols,
            src: ['http', 'https'],  // Only allow http/https for images
            href: ['http', 'https', 'mailto'],  // Links can use http/https/mailto
          },
        };

        const result = unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeSanitize, tiptapSchema)
          .use(rehypeSanitizeCSS)  // Additional CSS sanitization to block url() and dangerous properties
          .use(rehypeStringify)
          .processSync(processedContent);
        return String(result);
      } else {
        // Content is Markdown, process it normally
        const result = unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeSanitize)
          .use(rehypeStringify)
          .processSync(processedContent);
        return String(result);
      }
    } catch (error) {
      console.error("Errore nella conversione contenuto:", error);
      return "<p>Errore nella conversione del contenuto</p>";
    }
  }, [content, videoLinks]);

  const sortedImages = useMemo(() => {
    return [...images]
      .filter(img => !img.isArchived)
      .sort((a, b) => a.position - b.position);
  }, [images]);

  const hasMedia = videoLinks.length > 0 || sortedImages.length > 0;

  return (
    <article className="space-y-8">
      {htmlContent && (
        <div 
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-p:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          data-testid="post-content"
        />
      )}

      {videoLinks.length > 0 && (
        <div className="space-y-6" data-testid="video-embeds">
          {videoLinks.map((link, index) => {
            return (
              <div key={`video-${link}-${index}`} className="my-8">
                <VideoEmbed 
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
