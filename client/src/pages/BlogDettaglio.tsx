import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Post, PostImage } from "@shared/schema";
import PostContent from "@/components/blog/PostContent";
import SubscriptionBox from "@/components/blog/SubscriptionBox";
import ContactForm from "@/components/ContactForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Calendar, Clock, Tag, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useEffect } from "react";

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

  // SEO: Meta tags dinamici e JSON-LD per article
  useEffect(() => {
    if (!post) return;

    const siteUrl = window.location.origin;
    const pageUrl = `${siteUrl}/blog/${post.slug}`;
    
    // Meta title dinamico
    const metaTitle = post.metaTitle || `${post.titolo} | Blog Maggiolini`;
    document.title = metaTitle;

    // Meta description dinamica
    const metaDescription = post.metaDescription || post.sottotitolo || post.titolo;
    let metaDescTag = document.querySelector('meta[name="description"]');
    if (!metaDescTag) {
      metaDescTag = document.createElement('meta');
      metaDescTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescTag);
    }
    metaDescTag.setAttribute('content', metaDescription);

    // Open Graph tags
    const ogTags = [
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: metaTitle },
      { property: 'og:description', content: metaDescription },
      { property: 'og:url', content: pageUrl },
      { property: 'og:site_name', content: 'Maggiolini Immobiliare' },
    ];

    if (post.cover) {
      ogTags.push({ property: 'og:image', content: post.cover });
      ogTags.push({ property: 'og:image:alt', content: post.titolo });
    }

    if (post.publishedAt) {
      ogTags.push({ property: 'article:published_time', content: new Date(post.publishedAt).toISOString() });
    }

    if (post.autore) {
      ogTags.push({ property: 'article:author', content: post.autore });
    }

    if (post.tag && post.tag.length > 0) {
      post.tag.forEach(tag => {
        const tagMeta = document.createElement('meta');
        tagMeta.setAttribute('property', 'article:tag');
        tagMeta.setAttribute('content', tag);
        document.head.appendChild(tagMeta);
      });
    }

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: metaTitle },
      { name: 'twitter:description', content: metaDescription },
    ];

    if (post.cover) {
      twitterTags.push({ name: 'twitter:image', content: post.cover });
    }

    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // JSON-LD Article Schema
    const jsonLd: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.titolo,
      "description": metaDescription,
      "author": {
        "@type": "Person",
        "name": post.autore
      },
      "datePublished": post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date(post.createdAt).toISOString(),
      "dateModified": new Date(post.updatedAt).toISOString(),
      "publisher": {
        "@type": "Organization",
        "name": "Maggiolini Immobiliare",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`
        }
      }
    };

    if (post.cover) {
      jsonLd["image"] = post.cover;
    }

    if (post.categoria) {
      jsonLd["articleSection"] = post.categoria;
    }

    if (post.tag && post.tag.length > 0) {
      jsonLd["keywords"] = post.tag.join(', ');
    }

    let scriptTag = document.getElementById('article-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('id', 'article-schema');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLd);

    // Cleanup function per rimuovere i tag quando il componente viene smontato
    return () => {
      document.title = 'Maggiolini Immobiliare';
      const tagsToRemove = document.querySelectorAll('meta[property^="og:"], meta[property^="article:"], meta[name^="twitter:"], script[id="article-schema"]');
      tagsToRemove.forEach(tag => tag.remove());
    };
  }, [post]);

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
      {/* SEO: Breadcrumb - Home → Blog → Titolo */}
      <section className="py-6 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <span>/</span>
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

      {/* Contact Form */}
      <section className="py-12 border-t border-border">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <h3 className="text-2xl font-serif font-bold mb-6">Hai domande su questo articolo?</h3>
          <ContactForm source="blog" contextId={post.slug} />
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
