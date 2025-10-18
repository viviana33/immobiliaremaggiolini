import { useParams } from "wouter";

export default function BlogDettaglio() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <section className="py-6 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <nav className="text-sm text-muted-foreground">
            <span>Blog</span>
            {/* TODO: Implementare breadcrumb completo */}
          </nav>
        </div>
      </section>

      {/* Contenuto */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6">
            {/* TODO: Caricare titolo articolo */}
            Titolo Articolo
          </h1>
          {/* TODO: Implementare contenuto articolo completo */}
        </div>
      </section>
    </div>
  );
}
