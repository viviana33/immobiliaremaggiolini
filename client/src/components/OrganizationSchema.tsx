import { useEffect } from "react";

export default function OrganizationSchema() {
  useEffect(() => {
    const siteUrl = window.location.origin;
    
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Immobiliare Maggiolini",
      "description": "Agenzia immobiliare con oltre 20 anni di esperienza. Scopri le nostre proprietà in vendita e affitto.",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "telephone": "+39-02-1234567",
        "email": "info@maggiolini.it",
        "areaServed": "IT",
        "availableLanguage": ["Italian"]
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IT",
        "addressRegion": "Lombardia"
      },
      "sameAs": []
    };

    let scriptTag = document.getElementById('organization-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('id', 'organization-schema');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(organizationSchema);

    return () => {
      const tag = document.getElementById('organization-schema');
      if (tag) {
        tag.remove();
      }
    };
  }, []);

  return null;
}
