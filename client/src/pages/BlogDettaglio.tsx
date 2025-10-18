import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Post, PostImage } from "@shared/schema";
import PostContent from "@/components/blog/PostContent";
import SubscriptionBox from "@/components/blog/SubscriptionBox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

export default function BlogDettaglio() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading: isLoadingPost, error: postError } = useQuery<Post>({
    queryKey: [`/api/posts/${slug}`],
    enabled: !!slug,
  });

  const postId = post?.id;

  const { data: images = [], isLoading: isLoadingImages } = useQuery<PostImage[]>({
    queryKey: postId ? [`/api/posts/${postId}/images`] : ["disabled"],
    enabled: !!postId,
  });

  if (isLoadingPost) {
    return (
      <div className="min-h-screen">
        <section className="py-6 border-b border-border">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <Skeleton className="h-5 w-32" />
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6 md:px-8 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-4 pt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen">
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <Alert variant="destructive" data-testid="alert-error">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>
                {postError ? "Errore nel caricamento dell'articolo" : "Articolo non trovato"}
              </AlertDescription>
            </Alert>
            <div className="mt-6">
              <Link href="/blog">
                <Button variant="outline" data-testid="button-back-to-blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna al Blog
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <section className="py-6 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="breadcrumb">
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <span>/</span>
            {post.categoria && (
              <>
                <Link 
                  href={`/blog?categoria=${encodeURIComponent(post.categoria)}`}
                  className="hover:text-foreground transition-colors"
                >
                  {post.categoria}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground line-clamp-1">{post.titolo}</span>
          </nav>
        </div>
      </section>

      {/* Header */}
      <section className="py-12 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 md:px-8 space-y-6">
          {/* Categoria e Tag */}
          <div className="flex flex-wrap items-center gap-2">
            {post.categoria && (
              <Badge variant="secondary" data-testid="badge-category">
                {post.categoria}
              </Badge>
            )}
            {post.tag && post.tag.length > 0 && (
              <>
                {post.tag.map((tag) => (
                  <Badge key={tag} variant="outline" data-testid={`badge-tag-${tag}`}>
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </>
            )}
          </div>

          {/* Titolo */}
          <h1 
            className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-foreground"
            data-testid="post-title"
          >
            {post.titolo}
          </h1>

          {/* Sottotitolo */}
          {post.sottotitolo && (
            <p 
              className="text-xl md:text-2xl text-muted-foreground"
              data-testid="post-subtitle"
            >
              {post.sottotitolo}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2" data-testid="post-author">
              <span className="font-medium text-foreground">{post.autore}</span>
            </div>
            {publishedDate && (
              <div className="flex items-center gap-2" data-testid="post-date">
                <Calendar className="h-4 w-4" />
                <time dateTime={publishedDate.toISOString()}>
                  {formatDistanceToNow(publishedDate, { 
                    addSuffix: true, 
                    locale: it 
                  })}
                </time>
              </div>
            )}
            {post.readingTimeMin && (
              <div className="flex items-center gap-2" data-testid="post-reading-time">
                <Clock className="h-4 w-4" />
                <span>{post.readingTimeMin} min di lettura</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Immagine Cover */}
      {post.cover && (
        <section className="py-8 border-b border-border">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-muted">
              <img
                src={post.cover}
                alt={post.titolo}
                className="w-full h-full object-cover"
                data-testid="post-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Contenuto */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          {isLoadingImages ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <PostContent content={post.contenuto} images={images} />
          )}
        </div>
      </section>

      {/* Subscription Box */}
      <section className="py-12 border-t border-border">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <SubscriptionBox />
        </div>
      </section>

      {/* Footer con link ritorno */}
      <section className="py-8 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <Link href="/blog">
            <Button variant="outline" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna agli articoli
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
