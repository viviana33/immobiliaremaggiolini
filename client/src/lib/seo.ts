import { useEffect } from 'react';

interface MetaTagsOptions {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'product';
  url?: string;
  siteName?: string;
}

const DEFAULT_VALUES = {
  siteName: 'Maggiolini Immobiliare',
  description: 'Agenzia immobiliare specializzata in vendita e affitto di proprietà a Milano, Monza e Brianza. Professionalità, esperienza e servizio personalizzato dal 1985.',
  image: '/og-default.jpg',
  type: 'website' as const,
};

export function setMetaTags(options: MetaTagsOptions) {
  const {
    title,
    description = DEFAULT_VALUES.description,
    image = DEFAULT_VALUES.image,
    imageAlt,
    type = DEFAULT_VALUES.type,
    url = window.location.href,
    siteName = DEFAULT_VALUES.siteName,
  } = options;

  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  document.title = fullTitle;

  setOrCreateMetaTag('name', 'description', description);

  const ogTags = [
    { property: 'og:type', content: type },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: siteName },
    { property: 'og:image', content: image },
  ];

  if (imageAlt) {
    ogTags.push({ property: 'og:image:alt', content: imageAlt });
  }

  ogTags.forEach(({ property, content }) => {
    setOrCreateMetaTag('property', property, content);
  });

  const twitterTags = [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ];

  twitterTags.forEach(({ name, content }) => {
    setOrCreateMetaTag('name', name, content);
  });
}

function setOrCreateMetaTag(
  attributeName: 'name' | 'property',
  attributeValue: string,
  content: string
) {
  let tag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attributeName, attributeValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function usePageMeta(options: MetaTagsOptions) {
  useEffect(() => {
    setMetaTags(options);
  }, [options.title, options.description, options.image, options.url]);
}
