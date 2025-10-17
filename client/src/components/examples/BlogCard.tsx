import BlogCard from '../BlogCard';
import blogImage from "@assets/generated_images/Blog_lifestyle_image_1_9c81ebb5.png";

export default function BlogCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <BlogCard
        id="1"
        title="Come Scegliere il Quartiere Perfetto per la Tua Famiglia"
        excerpt="Scopri i fattori chiave da considerare quando cerchi la zona ideale dove vivere: scuole, servizi, trasporti e qualità della vita."
        image={blogImage}
        category="Consigli Casa"
        date="15 Marzo 2024"
        readTime="5 min"
      />
    </div>
  );
}
