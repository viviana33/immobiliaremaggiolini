import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Link } from "wouter";
import type { Post } from "@shared/schema";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const excerpt = post.sottotitolo || post.contenuto.substring(0, 150) + "...";
  
  const formattedDate = post.publishedAt
    ? format(new Date(post.publishedAt), "d MMMM yyyy", { locale: it })
    : "";
  
  const readTime = post.readingTimeMin
    ? `${post.readingTimeMin} min`
    : "5 min";

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card
        className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer group"
        data-testid={`card-blog-${post.slug}`}
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          {post.cover ? (
            <img
              src={post.cover}
              alt={post.titolo}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Nessuna immagine
            </div>
          )}
          {post.categoria && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="text-sm">
                {post.categoria}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-6 space-y-3">
          <h3
            className="font-serif font-semibold text-xl text-foreground line-clamp-2"
            data-testid={`text-blog-title-${post.slug}`}
          >
            {post.titolo}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
          <div className="flex items-center gap-4 pt-3 border-t border-border text-muted-foreground text-sm">
            {formattedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
