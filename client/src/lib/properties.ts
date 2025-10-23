import type { Property } from "./types";
import { slugify } from "./slug";

export async function getAllProperties(): Promise<Property[]> {
  try {
    const response = await fetch("/api/properties/all");
    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.statusText}`);
    }
    const data = await response.json();
    
    const properties = data.map((prop: any) => ({
      id: prop.id,
      slug: prop.slug,
      title: prop.titolo,
      location: prop.zona,
      price: prop.prezzo,
      images: [],
      features: [
        { label: "Superficie", value: `${prop.mq} m²` },
        { label: "Stanze", value: prop.stanze.toString() },
        { label: "Bagni", value: prop.bagni.toString() },
        { label: "Piano", value: prop.piano.toString() },
        { label: "Classe Energetica", value: prop.classeEnergetica },
      ],
      description: prop.descrizione,
      publishedAt: prop.createdAt,
    }));
    
    console.log(`[getAllProperties] Found ${properties.length} total properties`);
    
    return properties;
  } catch (error) {
    console.error("Error fetching all properties:", error);
    return [];
  }
}

export async function getPropertyBySlugOrId(key: string): Promise<Property | null> {
  try {
    const response = await fetch(`/api/properties/resolve/${encodeURIComponent(key)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch property: ${response.statusText}`);
    }
    
    const prop = await response.json();
    
    const property: Property = {
      id: prop.id,
      slug: prop.slug || `${slugify(prop.titolo)}-p${prop.id}`,
      title: prop.titolo,
      location: prop.zona,
      price: prop.prezzo,
      images: prop.images?.map((img: any) => img.urlHot || img.urlCold) || [],
      features: [
        { label: "Superficie", value: `${prop.mq} m²` },
        { label: "Stanze", value: prop.stanze.toString() },
        { label: "Bagni", value: prop.bagni.toString() },
        { label: "Piano", value: prop.piano.toString() },
        { label: "Classe Energetica", value: prop.classeEnergetica },
        { label: "Tipo", value: prop.tipo === "vendita" ? "Vendita" : "Affitto" },
      ],
      description: prop.descrizione,
      publishedAt: prop.createdAt,
    };
    
    return property;
  } catch (error) {
    console.error("Error fetching property by slug or id:", error);
    return null;
  }
}
