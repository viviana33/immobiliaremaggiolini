import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import blogImage1 from "@assets/generated_images/Blog_lifestyle_image_1_9c81ebb5.png";
import blogImage2 from "@assets/generated_images/Blog_lifestyle_image_2_e0f97e8e.png";
import { useState } from "react";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "Consigli Casa", "Mercato", "Territorio", "Lifestyle"];

  const blogPosts = [
    {
      id: "1",
      title: "Come Scegliere il Quartiere Perfetto per la Tua Famiglia",
      excerpt: "Scopri i fattori chiave da considerare quando cerchi la zona ideale dove vivere: scuole, servizi, trasporti e qualità della vita.",
      image: blogImage1,
      category: "Consigli Casa",
      date: "15 Marzo 2024",
      readTime: "5 min",
    },
    {
      id: "2",
      title: "Tendenze del Mercato Immobiliare Primavera 2024",
      excerpt: "Analisi dettagliata delle tendenze attuali nel mercato immobiliare lombardo e previsioni per i prossimi mesi.",
      image: blogImage2,
      category: "Mercato",
      date: "10 Marzo 2024",
      readTime: "7 min",
    },
    {
      id: "3",
      title: "Vivere a Milano: I Quartieri Più Ricercati",
      excerpt: "Una guida completa ai quartieri milanesi più desiderati, con focus su prezzi, servizi e stile di vita.",
      image: blogImage1,
      category: "Territorio",
      date: "5 Marzo 2024",
      readTime: "6 min",
    },
    {
      id: "4",
      title: "10 Consigli per Preparare la Tua Casa alla Vendita",
      excerpt: "Suggerimenti pratici per valorizzare il tuo immobile e attirare più acquirenti interessati.",
      image: blogImage2,
      category: "Consigli Casa",
      date: "1 Marzo 2024",
      readTime: "8 min",
    },
    {
      id: "5",
      title: "La Vita nei Borghi della Brianza",
      excerpt: "Scopri il fascino autentico dei borghi brianzoli e perché sempre più famiglie scelgono questa zona.",
      image: blogImage1,
      category: "Lifestyle",
      date: "25 Febbraio 2024",
      readTime: "6 min",
    },
    {
      id: "6",
      title: "Investire nel Mattone: È Ancora Conveniente?",
      excerpt: "Analisi approfondita sull'investimento immobiliare nel 2024: rendimenti, rischi e opportunità.",
      image: blogImage2,
      category: "Mercato",
      date: "20 Febbraio 2024",
      readTime: "10 min",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Il Nostro Blog
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Consigli, approfondimenti e storie dal mondo immobiliare e dalla vita quotidiana
          </p>
        </div>
      </section>

      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {category === "all" ? "Tutti gli Articoli" : category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} {...post} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="outline" size="lg" data-testid="button-load-more-articles">
              Carica Altri Articoli
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
