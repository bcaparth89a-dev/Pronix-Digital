import { Blog } from "../models/Blog.model.js";
import { Project } from "../models/Project.model.js";
import { FAQ } from "../models/FAQ.model.js";
import { env } from "../config/env.js";

const SITE_URL = env.SITE_URL.replace(/\/+$/, "");
const BLOG_PAGE_LIMIT = 9;
const PROJECT_PAGE_LIMIT = 12;

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function escapeXml(value) {
  return normalizeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, `${SITE_URL}/`).toString();
}

function formatDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function buildUrl(loc, { lastmod, images = [] } = {}) {
  return {
    loc: toAbsoluteUrl(loc),
    lastmod: formatDate(lastmod),
    images: images.filter(Boolean).map((image) => ({
      loc: toAbsoluteUrl(image.loc || image.url || image),
      caption: normalizeText(image.caption || image.alt || ""),
    })),
  };
}

function buildPageUrls(basePath, totalPages, query = {}) {
  const urls = [];
  for (let page = 1; page <= totalPages; page += 1) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const queryString = params.toString();
    urls.push(queryString ? `${basePath}?${queryString}` : basePath);
  }
  return urls;
}

function uniqueByKey(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

function serializeSitemap(entries, includeImages = false) {
  const namespace = includeImages
    ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : "";

  const body = entries
    .map((entry) => {
      const lines = ["  <url>", `    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) {
        lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }
      for (const image of entry.images || []) {
        lines.push("    <image:image>");
        lines.push(`      <image:loc>${escapeXml(image.loc)}</image:loc>`);
        if (image.caption) {
          lines.push(`      <image:caption>${escapeXml(image.caption)}</image:caption>`);
        }
        lines.push("    </image:image>");
      }
      lines.push("  </url>");
      return lines.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${namespace}>\n${body}\n</urlset>`;
}

async function buildBlogEntries() {
  const blogs = await Blog.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 }).lean();

  const baseEntries = blogs.map((blog) =>
    buildUrl(`/blog/${blog.slug}`, {
      lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
      images: [blog.coverImage, ...(blog.gallery || [])],
    }),
  );

  const categories = uniqueByKey(
    blogs.filter((blog) => normalizeText(blog.category)).map((blog) => blog.category.trim()),
    (value) => value.toLowerCase(),
  );

  const categoryEntries = categories.map((category) => {
    const matching = blogs.filter((blog) => normalizeText(blog.category).toLowerCase() === category.toLowerCase());
    return buildUrl(`/blog?category=${encodeURIComponent(category)}`, {
      lastmod: matching[0]?.updatedAt || matching[0]?.publishedAt || matching[0]?.createdAt,
    });
  });

  const totalPages = Math.max(Math.ceil(blogs.length / BLOG_PAGE_LIMIT), 1);
  const paginationEntries = buildPageUrls("/blog", totalPages).map((loc) => buildUrl(loc, { lastmod: blogs[0]?.updatedAt || blogs[0]?.publishedAt || blogs[0]?.createdAt }));

  return {
    entries: [...baseEntries, ...categoryEntries, ...paginationEntries],
    imageEntries: baseEntries,
  };
}

async function buildProjectEntries() {
  const projects = await Project.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 }).lean();

  const baseEntries = projects.map((project) =>
    buildUrl(`/portfolio/${project.slug}`, {
      lastmod: project.updatedAt || project.publishedAt || project.createdAt,
      images: [project.coverImage, ...(project.gallery || [])],
    }),
  );

  const industries = uniqueByKey(
    projects.filter((project) => normalizeText(project.industry)).map((project) => project.industry.trim()),
    (value) => value.toLowerCase(),
  );

  const industryEntries = industries.map((industry) => {
    const matching = projects.filter((project) => normalizeText(project.industry).toLowerCase() === industry.toLowerCase());
    return buildUrl(`/portfolio?industry=${encodeURIComponent(industry)}`, {
      lastmod: matching[0]?.updatedAt || matching[0]?.publishedAt || matching[0]?.createdAt,
    });
  });

  const totalPages = Math.max(Math.ceil(projects.length / PROJECT_PAGE_LIMIT), 1);
  const paginationEntries = buildPageUrls("/portfolio", totalPages).map((loc) => buildUrl(loc, { lastmod: projects[0]?.updatedAt || projects[0]?.publishedAt || projects[0]?.createdAt }));

  return {
    entries: [...baseEntries, ...industryEntries, ...paginationEntries],
    imageEntries: baseEntries,
  };
}

async function buildFaqEntries() {
  const faqs = await FAQ.find({ isActive: true }).sort({ sortOrder: 1, order: 1, createdAt: 1 }).lean();

  return {
    entries: [buildUrl("/faqs", { lastmod: faqs[0]?.updatedAt || faqs[0]?.createdAt })],
    imageEntries: [],
  };
}

export const seoService = {
  async buildSitemap() {
    const staticEntries = [
      buildUrl("/", { lastmod: new Date() }),
      buildUrl("/about"),
      buildUrl("/services"),
      buildUrl("/contact"),
      buildUrl("/privacy"),
      buildUrl("/terms"),
      buildUrl("/blog"),
      buildUrl("/portfolio"),
      buildUrl("/faqs"),
    ];

    const [blogData, projectData, faqData] = await Promise.all([
      buildBlogEntries(),
      buildProjectEntries(),
      buildFaqEntries(),
    ]);

    const entries = uniqueByKey(
      [...staticEntries, ...blogData.entries, ...projectData.entries, ...faqData.entries],
      (entry) => entry.loc,
    );
    const imageEntries = uniqueByKey([...blogData.imageEntries, ...projectData.imageEntries], (entry) => entry.loc);

    return {
      xml: serializeSitemap(entries, false),
      imageXml: serializeSitemap(imageEntries, true),
      count: entries.length,
    };
  },

  buildRobotsTxt() {
    return [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin/",
      "Disallow: /dashboard/",
      "Disallow: /login",
      "Disallow: /api/",
      "Sitemap: " + `${SITE_URL}/sitemap.xml`,
      "Sitemap: " + `${SITE_URL}/sitemap-images.xml`,
      "",
    ].join("\n");
  },
};
