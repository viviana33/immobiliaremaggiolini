import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
}

export default function BlogCard({
  title,
  excerpt,
  image,
  category,
  date,
  readTime,
}: BlogCardProps) {
  return (
    <Card
      className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer group"
      data-testid={`card-blog-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="text-sm">
            {category}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-3">
        <h3 className="font-serif font-semibold text-xl text-foreground line-clamp-2" data-testid="text-blog-title">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
          {excerpt}
        </p>
        <div className="flex items-center gap-4 pt-3 border-t border-border text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{readTime}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
