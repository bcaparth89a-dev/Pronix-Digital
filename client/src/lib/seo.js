import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { publicRoutes } from "@/config/navigation";
import { businessProfile, getLocationProfile } from "@/config/business";
import { env } from "@/config/env";

export const SITE_NAME = env.VITE_APP_NAME;
export const SITE_URL = env.VITE_SITE_URL.replace(/\/+$/, "");
export const DEFAULT_DESCRIPTION =
  "Pronix Digital is a software development agency building websites, mobile apps, custom software, AI solutions, SEO campaigns, and digital products for businesses in Vadodara, Surat, Gujarat, India, and worldwide remote teams.";
export const DEFAULT_IMAGE = "/seo/og-image.png";
export const DEFAULT_TWITTER_IMAGE = "/seo/twitter-image.png";
export const DEFAULT_ROBOTS = "index,follow";
export const RESTRICTED_ROBOTS = "noindex,nofollow";

export const BASE_KEYWORDS = [
  SITE_NAME,
  "software development agency",
  "website development",
  "mobile app development",
  "custom software development",
  "AI solutions",
  "SEO and digital marketing",
  "graphic design",
  "video editing",
  "UI/UX design",
  "ERP CRM systems",
  "cloud deployment",
  "Vadodara",
  "Surat",
  "Gujarat",
  "India",
  "remote software development",
];

export function normalizeText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateAtWordBoundary(value, maxLength) {
  const text = normalizeText(value);
  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, maxLength).trimEnd();
  const lastSpace = sliced.lastIndexOf(" ");
  const candidate = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${candidate.trimEnd()}...`;
}

export function humanizeSlug(value) {
  return normalizeText(value)
    .split(/[/-]+/)
    .filter(Boolean)
    .map((segment) => segment.replace(/[_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(" ");
}

export function normalizeList(values) {
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => normalizeText(value))
    .filter(Boolean);
}

export function uniqueKeywords(values) {
  const seen = new Set();
  const keywords = [];

  for (const value of normalizeList(values)) {
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      keywords.push(value);
    }
  }

  return keywords;
}

export function toAbsoluteUrl(value) {
  if (!value) {
    return `${SITE_URL}/`;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return new URL(value, SITE_URL).toString();
}

export function createLocationEntity(locationKey) {
  const location = getLocationProfile(locationKey);
  if (!location) {
    return null;
  }

  const canonical = `${SITE_URL}/${location.slug}-website-development`;

  return {
    location,
    canonical,
    title: location.title,
    description: location.description,
    breadcrumbs: [
      { name: SITE_NAME, url: `${SITE_URL}/` },
      { name: location.name, url: canonical },
    ],
  };
}

export function createCanonicalUrl(pathname, search, canonicalParams = [], overrides = {}) {
  const url = new URL(pathname || "/", SITE_URL);
  const searchParams = new URLSearchParams(search || "");

  for (const paramName of canonicalParams) {
    const value = Object.prototype.hasOwnProperty.call(overrides, paramName)
      ? overrides[paramName]
      : searchParams.get(paramName);
    if (value) {
      url.searchParams.set(paramName, value);
    }
  }

  return url.toString();
}

export function createBreadcrumbItems({ pathname, canonical, sectionName, title, secondaryLabel, searchLabel }) {
  const crumbs = [{ name: SITE_NAME, url: `${SITE_URL}/` }];

  if (sectionName) {
    const sectionUrl = pathname.startsWith("/blog")
      ? `${SITE_URL}${publicRoutes.blog}`
      : `${SITE_URL}${publicRoutes.portfolio}`;
    crumbs.push({ name: sectionName, url: sectionUrl });
  }

  if (searchLabel) {
    crumbs.push({ name: searchLabel, url: canonical });
  } else if (secondaryLabel) {
    crumbs.push({ name: secondaryLabel, url: canonical });
  } else if (title) {
    crumbs.push({ name: title, url: canonical });
  }

  return crumbs;
}

export function buildKeywords({ title, description, entity, category, tags, services, technologies, industry, extras }) {
  const entityKeywords = [
    entity?.seoTitle,
    entity?.seoDescription,
    entity?.title,
    entity?.summary,
    entity?.excerpt,
    entity?.category,
    entity?.industry,
    entity?.tags,
    entity?.services,
    entity?.technologies,
  ];

  return uniqueKeywords([
    BASE_KEYWORDS,
    title,
    description,
    category,
    tags,
    services,
    technologies,
    industry,
    entityKeywords,
    extras,
  ]).slice(0, 18);
}

function defaultPublicRouteMetadata(pathname, search) {
  const searchParams = new URLSearchParams(search || "");
  const page = Math.max(Number(searchParams.get("page") || 1), 1);

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname === publicRoutes.login) {
    return {
      title: humanizeSlug(pathname) || SITE_NAME,
      description: "Restricted administrative area for Pronix Digital.",
      robots: RESTRICTED_ROBOTS,
      breadcrumbs: [{ name: SITE_NAME, url: `${SITE_URL}/` }],
      type: "website",
    };
  }

  const locationPathMatch = pathname.match(/^\/(vadodara|surat|gujarat|india|remote)-website-development$/i);
  if (locationPathMatch) {
    const locationEntity = createLocationEntity(locationPathMatch[1]);
    if (locationEntity) {
      return {
        title: locationEntity.title,
        description: locationEntity.description,
        breadcrumbs: locationEntity.breadcrumbs,
        canonicalParams: [],
        locationKey: locationPathMatch[1],
        type: "website",
      };
    }
  }

  if (pathname === publicRoutes.home) {
    return {
      title: "Software Development Agency for Web, Mobile, AI, SEO and Digital Products",
      description: DEFAULT_DESCRIPTION,
      keywords: ["software development agency", "web development", "mobile app development", "AI solutions"],
      breadcrumbs: [{ name: SITE_NAME, url: `${SITE_URL}/` }],
      type: "website",
    };
  }

  if (pathname === publicRoutes.faqs) {
    return {
      title: "Frequently Asked Questions",
      description: "Answers to common questions about Pronix Digital, our process, and our services.",
      breadcrumbs: [
        { name: SITE_NAME, url: `${SITE_URL}/` },
        { name: "Frequently Asked Questions", url: `${SITE_URL}${publicRoutes.faqs}` },
      ],
      type: "website",
    };
  }

  if (pathname === publicRoutes.about) {
    return {
      title: "About Pronix Digital",
      description:
        "Meet Pronix Digital, a software development agency serving Vadodara, Surat, Gujarat, India, and global remote clients with modern digital products.",
      keywords: ["about Pronix Digital", "software development agency", "Vadodara", "Surat", "Gujarat"],
      breadcrumbs: [
        { name: SITE_NAME, url: `${SITE_URL}/` },
        { name: "About", url: `${SITE_URL}${publicRoutes.about}` },
      ],
      type: "website",
    };
  }

  if (pathname === publicRoutes.services) {
    return {
      title: "Software Development Services",
      description:
        "Website development, mobile apps, custom software, AI solutions, SEO, design, and cloud deployment for growing businesses.",
      keywords: ["website development", "mobile app development", "custom software development", "SEO services"],
      breadcrumbs: [
        { name: SITE_NAME, url: `${SITE_URL}/` },
        { name: "Services", url: `${SITE_URL}${publicRoutes.services}` },
      ],
      type: "website",
    };
  }

  if (pathname === publicRoutes.contact) {
    return {
      title: "Contact Pronix Digital",
      description:
        "Start your next website, app, software, or SEO engagement with Pronix Digital. Available in Vadodara, Surat, Gujarat, India, and remotely worldwide.",
      keywords: ["contact software agency", "Vadodara", "Surat", "remote development"],
      breadcrumbs: [
        { name: SITE_NAME, url: `${SITE_URL}/` },
        { name: "Contact", url: `${SITE_URL}${publicRoutes.contact}` },
      ],
      type: "website",
    };
  }

  if (pathname === publicRoutes.blog) {
    const searchValue = searchParams.get("search");
    const categoryValue = searchParams.get("category");

    if (searchValue) {
      return {
        title: `Search results for ${searchValue}`,
        description: `Search results for ${searchValue} in the Pronix Digital journal.`,
        keywords: [searchValue, "blog search", "journal"],
        canonicalParams: ["search", "page"],
        robots: RESTRICTED_ROBOTS,
        breadcrumbs: [
          { name: SITE_NAME, url: `${SITE_URL}/` },
          { name: "Journal", url: `${SITE_URL}${publicRoutes.blog}` },
          { name: `Search: ${searchValue}`, url: createCanonicalUrl(pathname, search, []) },
        ],
        page,
        type: "website",
      };
    }

    if (categoryValue) {
      return {
        title: `${categoryValue} articles`,
        description: `Browse Pronix Digital journal entries in the ${categoryValue} category.`,
        keywords: [categoryValue, "blog category", "journal"],
        canonicalParams: ["category", "page"],
        breadcrumbs: [
          { name: SITE_NAME, url: `${SITE_URL}/` },
          { name: "Journal", url: `${SITE_URL}${publicRoutes.blog}` },
          { name: categoryValue, url: createCanonicalUrl(pathname, search, ["category"]) },
        ],
        page,
        type: "website",
      };
    }

    return {
      title: page > 1 ? `Software Development Insights, Case Studies and SEO Tips - Page ${page}` : "Software Development Insights, Case Studies and SEO Tips",
      description:
        "Read articles about websites, mobile apps, custom software, SEO, design, and product delivery from Pronix Digital.",
      keywords: ["software development blog", "case studies", "SEO tips", "mobile app development"],
      breadcrumbs: [
        { name: SITE_NAME, url: `${SITE_URL}/` },
        { name: "Journal", url: `${SITE_URL}${publicRoutes.blog}` },
      ],
      canonicalParams: ["page"],
      page,
      type: "website",
    };
  }

  if (pathname === publicRoutes.portfolio) {
    const industryValue = searchParams.get("industry");

    if (industryValue) {
      return {
        title: `${industryValue} projects`,
        description: `Explore case studies and portfolio projects for ${industryValue.toLowerCase()} clients by Pronix Digital.`,
        keywords: [industryValue, "portfolio", "case studies"],
        canonicalParams: ["industry", "page"],
        breadcrumbs: [
          { name: SITE_NAME, url: `${SITE_URL}/` },
          { name: "Selected Works", url: `${SITE_URL}${publicRoutes.portfolio}` },
          { name: industryValue, url: createCanonicalUrl(pathname, search, ["industry"]) },
        ],
        page,
        type: "website",
      };
    }

    return {
      title: page > 1 ? `Selected Works and Case Studies - Page ${page}` : "Selected Works and Case Studies",
      description:
        "Explore selected work from Pronix Digital, including websites, mobile apps, custom software, AI tools, and business platforms.",
      keywords: ["portfolio", "case studies", "selected works", "software projects"],
      breadcrumbs: [
        { name: SITE_NAME, url: `${SITE_URL}/` },
        { name: "Selected Works", url: `${SITE_URL}${publicRoutes.portfolio}` },
      ],
      canonicalParams: ["page"],
      page,
      type: "website",
    };
  }

  if (pathname === publicRoutes.privacy) {
    return {
      title: "Privacy Policy",
      description: "Read how Pronix Digital handles your data, privacy, and communication preferences.",
      breadcrumbs: [
        { name: SITE_NAME, url: `${SITE_URL}/` },
        { name: "Privacy Policy", url: `${SITE_URL}${publicRoutes.privacy}` },
      ],
      type: "website",
    };
  }

  if (pathname === publicRoutes.terms) {
    return {
      title: "Terms of Service",
      description: "Review the terms that govern your use of Pronix Digital services and website.",
      breadcrumbs: [
        { name: SITE_NAME, url: `${SITE_URL}/` },
        { name: "Terms of Service", url: `${SITE_URL}${publicRoutes.terms}` },
      ],
      type: "website",
    };
  }

  if (/^\/blog\/[^/]+$/i.test(pathname) || /^\/portfolio\/[^/]+$/i.test(pathname)) {
    const sectionName = pathname.startsWith("/blog") ? "Journal" : "Selected Works";
    return {
      title: humanizeSlug(pathname.split("/").pop()) || sectionName,
      description: DEFAULT_DESCRIPTION,
      canonicalParams: [],
      breadcrumbs: [
        { name: SITE_NAME, url: `${SITE_URL}/` },
        { name: sectionName, url: pathname.startsWith("/blog") ? `${SITE_URL}${publicRoutes.blog}` : `${SITE_URL}${publicRoutes.portfolio}` },
      ],
      type: "article",
    };
  }

  return {
    title: humanizeSlug(pathname) || SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    breadcrumbs: [{ name: SITE_NAME, url: `${SITE_URL}/` }],
    type: "website",
  };
}

function updateMetaSelector(selector, createNode) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = createNode();
    document.head.appendChild(node);
  }
  return node;
}

function setMetaAttribute(selector, attributeName, attributeValue, content) {
  const node = updateMetaSelector(selector, () => {
    const meta = document.createElement("meta");
    meta.setAttribute(attributeName, attributeValue);
    return meta;
  });

  node.setAttribute(attributeName, attributeValue);
  node.setAttribute("content", content || "");
}

function setLinkAttribute(selector, rel, href) {
  const node = updateMetaSelector(selector, () => {
    const link = document.createElement("link");
    link.setAttribute("rel", rel);
    return link;
  });

  node.setAttribute("rel", rel);
  node.setAttribute("href", href);
}

function removeNode(selector) {
  const node = document.head.querySelector(selector);
  if (node) {
    node.remove();
  }
}

function setJsonLd(data) {
  const selector = 'script[data-pronix-seo="breadcrumbs"]';
  if (!data || data.length === 0) {
    removeNode(selector);
    return;
  }

  const node = updateMetaSelector(selector, () => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-pronix-seo", "breadcrumbs");
    return script;
  });

  node.textContent = JSON.stringify(data);
}

export function resolveSeoMetadata({
  pathname = "/",
  search = "",
  title,
  description,
  image,
  twitterImage,
  keywords,
  canonical,
  robots,
  type,
  entity,
  breadcrumbs,
  sectionName,
  secondaryLabel,
  searchLabel,
  canonicalParams,
  noindex = false,
  appendSiteName = true,
  extraKeywords = [],
  page,
  totalPages,
  faqItems,
  serviceItems,
  locationKey,
  teamMembers,
} = {}) {
  const routeDefaults = defaultPublicRouteMetadata(pathname, search);
  const locationEntity = locationKey ? createLocationEntity(locationKey) : null;
  const entityTitle = normalizeText(entity?.seoTitle || entity?.title || entity?.name);
  const entityDescription = normalizeText(entity?.seoDescription || entity?.excerpt || entity?.summary || entity?.description);
  const entityImage = entity?.coverImage?.url || entity?.coverImage?.src || entity?.image?.url || entity?.image;
  const fallbackTitle = title ?? entityTitle ?? locationEntity?.title ?? routeDefaults.title;
  const fallbackDescription = description ?? entityDescription ?? locationEntity?.description ?? routeDefaults.description ?? DEFAULT_DESCRIPTION;
  const currentPage = Math.max(Number(page || routeDefaults.page || new URLSearchParams(search || "").get("page") || 1), 1);
  const finalCanonical = canonical || createCanonicalUrl(pathname, search, canonicalParams || routeDefaults.canonicalParams || []);
  const finalTitle = appendSiteName && fallbackTitle && !fallbackTitle.toLowerCase().includes(SITE_NAME.toLowerCase())
    ? `${truncateAtWordBoundary(fallbackTitle, 120)} | ${SITE_NAME}`
    : truncateAtWordBoundary(fallbackTitle || SITE_NAME, 160);
  const finalDescription = truncateAtWordBoundary(fallbackDescription, 160) || DEFAULT_DESCRIPTION;
  const finalImage = toAbsoluteUrl(image || entityImage || routeDefaults.image || DEFAULT_IMAGE);
  const finalTwitterImage = toAbsoluteUrl(twitterImage || image || entityImage || routeDefaults.twitterImage || DEFAULT_TWITTER_IMAGE);
  const finalRobots = noindex ? RESTRICTED_ROBOTS : robots || routeDefaults.robots || DEFAULT_ROBOTS;
  const finalType = type || routeDefaults.type || "website";
  const finalBreadcrumbs = breadcrumbs || routeDefaults.breadcrumbs || createBreadcrumbItems({
    pathname,
    canonical: finalCanonical,
    sectionName,
    title: fallbackTitle,
    secondaryLabel,
    searchLabel,
  });

  const pagination = currentPage > 1 || (totalPages && totalPages > 1)
    ? {
        currentPage,
        totalPages: totalPages || null,
        prev: currentPage > 1 ? createCanonicalUrl(pathname, search, [...new Set([...(canonicalParams || routeDefaults.canonicalParams || []), "page"])], { page: currentPage - 1 }) : null,
        next: totalPages && currentPage < totalPages ? createCanonicalUrl(pathname, search, [...new Set([...(canonicalParams || routeDefaults.canonicalParams || []), "page"])], { page: currentPage + 1 }) : null,
      }
    : null;

  const finalKeywords = buildKeywords({
    title: finalTitle,
    description: finalDescription,
    entity,
    category: entity?.category,
    tags: entity?.tags,
    services: entity?.services,
    technologies: entity?.technologies,
    industry: entity?.industry,
    extras: [keywords, routeDefaults.keywords, extraKeywords],
  });

  return {
    title: finalTitle,
    description: finalDescription,
    canonical: finalCanonical,
    image: finalImage,
    twitterImage: finalTwitterImage,
    keywords: finalKeywords,
    robots: finalRobots,
    type: finalType,
    breadcrumbs: finalBreadcrumbs,
    pagination,
    // Add raw metadata properties for dynamic buildStructuredData build
    rawParams: {
      canonical: finalCanonical,
      breadcrumbs: finalBreadcrumbs,
      pathname,
      title: finalTitle,
      description: finalDescription,
      entity,
      faqItems,
      serviceItems,
      locationKey,
      teamMembers,
    },
  };
}

export function applySeoMetadata(metadata) {
  if (typeof document === "undefined" || !metadata) {
    return;
  }

  document.title = metadata.title || SITE_NAME;

  setMetaAttribute('meta[name="description"]', "name", "description", metadata.description);
  setMetaAttribute('meta[name="keywords"]', "name", "keywords", metadata.keywords?.length ? metadata.keywords.join(", ") : "");
  setMetaAttribute('meta[name="robots"]', "name", "robots", metadata.robots || DEFAULT_ROBOTS);
  setMetaAttribute('meta[property="og:title"]', "property", "og:title", metadata.title || SITE_NAME);
  setMetaAttribute('meta[property="og:description"]', "property", "og:description", metadata.description || DEFAULT_DESCRIPTION);
  setMetaAttribute('meta[property="og:type"]', "property", "og:type", metadata.type || "website");
  setMetaAttribute('meta[property="og:url"]', "property", "og:url", metadata.canonical || `${SITE_URL}/`);
  setMetaAttribute('meta[property="og:image"]', "property", "og:image", metadata.image || `${SITE_URL}${DEFAULT_IMAGE}`);
  setMetaAttribute('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
  setMetaAttribute('meta[property="og:locale"]', "property", "og:locale", "en_US");
  setMetaAttribute('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  setMetaAttribute('meta[name="twitter:title"]', "name", "twitter:title", metadata.title || SITE_NAME);
  setMetaAttribute('meta[name="twitter:description"]', "name", "twitter:description", metadata.description || DEFAULT_DESCRIPTION);
  setMetaAttribute('meta[name="twitter:image"]', "name", "twitter:image", metadata.twitterImage || metadata.image || `${SITE_URL}${DEFAULT_TWITTER_IMAGE}`);
  setLinkAttribute('link[rel="canonical"]', "canonical", metadata.canonical || `${SITE_URL}/`);
  if (metadata.pagination?.prev) {
    setLinkAttribute('link[rel="prev"]', "prev", metadata.pagination.prev);
  } else {
    removeNode('link[rel="prev"]');
  }

  if (metadata.pagination?.next) {
    setLinkAttribute('link[rel="next"]', "next", metadata.pagination.next);
  } else {
    removeNode('link[rel="next"]');
  }

  // Load schemas asynchronously and apply JSON-LD
  if (metadata.rawParams) {
    import("./seo-schemas").then(({ buildStructuredData }) => {
      const structuredData = buildStructuredData(metadata.rawParams);
      setJsonLd(structuredData);
    });
  }
}

export function SeoBridge() {
  const location = useLocation();

  const metadata = useMemo(
    () => resolveSeoMetadata({ pathname: location.pathname, search: location.search }),
    [location.pathname, location.search],
  );

  useEffect(() => {
    applySeoMetadata(metadata);
  }, [metadata]);

  return null;
}

export function useSeoMetadata(input = {}) {
  const location = useLocation();

  const metadata = useMemo(
    () =>
      resolveSeoMetadata({
        pathname: location.pathname,
        search: location.search,
        ...input,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      input.appendSiteName,
      input.breadcrumbs,
      input.canonical,
      input.canonicalParams,
      input.description,
      input.entity,
      input.extraKeywords,
      input.image,
      input.keywords,
      input.noindex,
      input.robots,
      input.page,
      input.totalPages,
      input.faqItems,
      input.serviceItems,
      input.searchLabel,
      input.secondaryLabel,
      input.sectionName,
      input.locationKey,
      input.teamMembers,
      input.title,
      input.twitterImage,
      input.type,
      location.pathname,
      location.search,
    ],
  );

  useEffect(() => {
    applySeoMetadata(metadata);
  }, [metadata]);

  return metadata;
}
