import { publicRoutes } from "@/config/navigation";
import { businessProfile, getLocationProfile } from "@/config/business";
import {
  normalizeText,
  toAbsoluteUrl,
  createLocationEntity,
  normalizeList,
  SITE_NAME,
  SITE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
} from "./seo";

function createGeoCoordinatesSchema(geo = businessProfile.geo) {
  if (!geo?.latitude || !geo?.longitude) {
    return undefined;
  }

  return {
    "@type": "GeoCoordinates",
    latitude: geo.latitude,
    longitude: geo.longitude,
  };
}

function createPostalAddressSchema(address = businessProfile.address) {
  if (!address) {
    return undefined;
  }

  return {
    "@type": "PostalAddress",
    streetAddress: address.streetAddress,
    addressLocality: address.addressLocality,
    addressRegion: address.addressRegion,
    postalCode: address.postalCode,
    addressCountry: address.addressCountry,
  };
}

function createServiceAreaNodes(serviceAreas = businessProfile.serviceAreas) {
  return (serviceAreas || []).map((area) => {
    const location = getLocationProfile(area);

    return {
      "@type": "AdministrativeArea",
      name: location?.name || area,
    };
  });
}

function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: businessProfile.name,
    url: businessProfile.website,
    logo: `${SITE_URL}/branding/logo-horizontal.svg`,
    email: businessProfile.email,
    telephone: businessProfile.phone,
    sameAs: businessProfile.sameAs,
  };
}

function createPersonSchema(person) {
  if (!person?.name) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.role,
    description: person.description,
    url: person.url,
    sameAs: person.sameAs,
    email: person.email,
    telephone: person.phone,
    knowsAbout: person.knowsAbout,
    alumniOf: person.alumniOf,
  };
}

function createLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    legalName: businessProfile.name,
    url: businessProfile.website,
    telephone: businessProfile.phone,
    email: businessProfile.email,
    priceRange: businessProfile.priceRange,
    image: `${SITE_URL}${DEFAULT_IMAGE}`,
    address: createPostalAddressSchema(),
    geo: createGeoCoordinatesSchema(),
    openingHoursSpecification: (businessProfile.openingHours || []).map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: hours.split(" ")[1]?.split("-")[0] || "09:00",
      closes: hours.split(" ")[1]?.split("-")[1] || "18:00",
    })),
    areaServed: createServiceAreaNodes(),
    serviceArea: createServiceAreaNodes(),
    hasMap: `https://www.google.com/maps/search/?api=1&query=${businessProfile.geo.latitude},${businessProfile.geo.longitude}`,
  };
}

function createProfessionalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE_NAME,
    legalName: businessProfile.name,
    url: businessProfile.website,
    telephone: businessProfile.phone,
    email: businessProfile.email,
    address: createPostalAddressSchema(),
    geo: createGeoCoordinatesSchema(),
    areaServed: createServiceAreaNodes(),
    serviceArea: createServiceAreaNodes(),
    serviceType: ["Website Development", "Mobile App Development", "Custom Software Development", "AI Solutions"],
  };
}

function createWebsiteSchema({ canonical, description }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: canonical || `${SITE_URL}/`,
    description: description || DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

function createWebPageSchema({ canonical, title, description }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title || SITE_NAME,
    url: canonical || `${SITE_URL}/`,
    description: description || DEFAULT_DESCRIPTION,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
  };
}

function createBlogSchemas({ canonical, title, description, entity }) {
  const imageUrl = entity?.coverImage?.url ? toAbsoluteUrl(entity.coverImage.url) : undefined;

  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title || entity?.title || SITE_NAME,
      name: title || entity?.title || SITE_NAME,
      description: description || entity?.excerpt || DEFAULT_DESCRIPTION,
      url: canonical,
      mainEntityOfPage: canonical,
      articleSection: entity?.category,
      keywords: normalizeList([entity?.tags, entity?.category]).join(", "),
      image: imageUrl ? [imageUrl] : undefined,
      datePublished: entity?.publishedAt || entity?.createdAt,
      dateModified: entity?.updatedAt,
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title || entity?.title || SITE_NAME,
      description: description || entity?.excerpt || DEFAULT_DESCRIPTION,
      url: canonical,
      image: imageUrl ? [imageUrl] : undefined,
      datePublished: entity?.publishedAt || entity?.createdAt,
      dateModified: entity?.updatedAt,
      author: entity?.author ? { "@type": "Person", name: normalizeText(entity.author.name || entity.author) } : { "@type": "Organization", name: SITE_NAME },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/branding/logo-horizontal.svg` },
      },
    },
  ];
}

function createSoftwareApplicationSchema({ canonical, title, description, entity }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title || entity?.title || SITE_NAME,
    description: description || entity?.summary || DEFAULT_DESCRIPTION,
    url: canonical,
    applicationCategory: entity?.industry || entity?.services?.[0] || "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
    },
  };
}

function createServiceSchemas({ serviceItems, _title, description, canonical }) {
  const items = Array.isArray(serviceItems) ? serviceItems : [];
  return items.map((service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: normalizeText(service.title),
    serviceType: normalizeText(service.title),
    description: normalizeText(service.longDescription || service.description || description || DEFAULT_DESCRIPTION),
    url: canonical,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: businessProfile.website,
    },
    areaServed: createServiceAreaNodes(),
  }));
}

function createFaqSchema(faqItems) {
  const items = Array.isArray(faqItems) ? faqItems.filter(Boolean) : [];
  if (items.length === 0) {
    return [];
  }

  return [{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: normalizeText(faq.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: normalizeText(faq.answer),
      },
    })),
  }];
}

export function buildStructuredData({
  canonical,
  breadcrumbs,
  pathname,
  title,
  description,
  entity,
  faqItems,
  serviceItems,
  locationKey,
  teamMembers,
}) {
  const data = [];
  const locationEntity = locationKey ? createLocationEntity(locationKey) : null;

  if (breadcrumbs.length > 1) {
    data.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  if (pathname === publicRoutes.home) {
    data.push(createOrganizationSchema());
    data.push(createLocalBusinessSchema());
    data.push(createProfessionalServiceSchema());
    data.push(createWebsiteSchema({ canonical, description }));
    data.push(createWebPageSchema({ canonical, title, description }));
    data.push(...createFaqSchema(faqItems));
  } else if (pathname === publicRoutes.services) {
    data.push(createOrganizationSchema());
    data.push(createLocalBusinessSchema());
    data.push(createProfessionalServiceSchema());
    data.push(createWebsiteSchema({ canonical, description }));
    data.push(createWebPageSchema({ canonical, title, description }));
    data.push(...createServiceSchemas({ serviceItems, title, description, canonical }));
  } else if (pathname === publicRoutes.faqs) {
    data.push(createOrganizationSchema());
    data.push(createLocalBusinessSchema());
    data.push(createProfessionalServiceSchema());
    data.push(createWebsiteSchema({ canonical, description }));
    data.push(createWebPageSchema({ canonical, title, description }));
    data.push(...createFaqSchema(faqItems));
  } else if (pathname === publicRoutes.contact) {
    data.push(createOrganizationSchema());
    data.push(createLocalBusinessSchema());
    data.push(createProfessionalServiceSchema());
    data.push(createWebsiteSchema({ canonical, description }));
    data.push(createWebPageSchema({ canonical, title, description }));
  } else if (pathname === publicRoutes.about) {
    data.push(createOrganizationSchema());
    data.push(createLocalBusinessSchema());
    data.push(createProfessionalServiceSchema());
    data.push(createWebsiteSchema({ canonical, description }));
    data.push(createWebPageSchema({ canonical, title, description }));
    if (Array.isArray(teamMembers)) {
      for (const member of teamMembers) {
        const personSchema = createPersonSchema(member);
        if (personSchema) {
          data.push(personSchema);
        }
      }
    }
  } else if (/^\/blog\/[^/]+$/i.test(pathname)) {
    data.push(createWebsiteSchema({ canonical, description }));
    data.push(createWebPageSchema({ canonical, title, description }));
    data.push(...createBlogSchemas({ canonical, title, description, entity }));
  } else if (/^\/portfolio\/[^/]+$/i.test(pathname)) {
    data.push(createWebsiteSchema({ canonical, description }));
    data.push(createWebPageSchema({ canonical, title, description }));
    data.push(createSoftwareApplicationSchema({ canonical, title, description, entity }));
    data.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title || entity?.title || SITE_NAME,
      description: description || entity?.summary || DEFAULT_DESCRIPTION,
      url: canonical,
      image: entity?.coverImage?.url ? [toAbsoluteUrl(entity.coverImage.url)] : undefined,
      datePublished: entity?.publishedAt || entity?.createdAt,
      dateModified: entity?.updatedAt,
    });
  } else {
    data.push(createWebsiteSchema({ canonical, description }));
    data.push(createWebPageSchema({ canonical, title, description }));
  }

  if (Array.isArray(faqItems) && faqItems.length > 0 && !data.some((item) => item?.["@type"] === "FAQPage")) {
    data.push(...createFaqSchema(faqItems));
  }

  if (locationEntity) {
    data.push({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: locationEntity.location.name,
      url: locationEntity.canonical,
      address: createPostalAddressSchema({
        streetAddress: `${locationEntity.location.name}, Gujarat, India`,
        addressLocality: locationEntity.location.name,
        addressRegion: "Gujarat",
        addressCountry: "IN",
      }),
      geo: createGeoCoordinatesSchema(locationEntity.location.geo),
      areaServed: createServiceAreaNodes([locationEntity.location.name, "Gujarat", "India"]),
      serviceArea: createServiceAreaNodes([locationEntity.location.name, "Gujarat", "India"]),
    });
  }

  return data;
}
