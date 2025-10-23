export type Property = {
  id: string;
  slug?: string;
  title: string;
  location?: string;
  price?: string | number;
  images: string[];
  features?: { label: string; value: string }[];
  description?: string;
  publishedAt?: string;
};
