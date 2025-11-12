import PropertyCard from '../PropertyCard';
import apartmentImage from "@assets/generated_images/Apartment_interior_property_image_66b8a52c.png";

export default function PropertyCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <PropertyCard
        id="1"
        title="Elegante Appartamento Centro"
        location="Milano, Porta Nuova"
        price="€ 450.000"
        image={apartmentImage}
        type="vendita"
        bedrooms={3}
        bathrooms={2}
        area={120}
      />
    </div>
  );
}
