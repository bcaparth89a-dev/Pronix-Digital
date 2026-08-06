import { httpStatus } from "../constants/httpStatus.js";
import { blogDto, blogListDto } from "../dtos/blog.dto.js";
import { blogRepository } from "../repositories/blog.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { createSeoDescription, createSeoTitle } from "../utils/seo.js";
import { createUniqueSlug } from "./slug.service.js";

function calculateReadingTime(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(Math.ceil(words / 200), 1);
}

function prepareBlogPayload(payload) {
  const prepared = { ...payload };

  if (prepared.tags) {
    prepared.tags = prepared.tags.map((tag) => tag.toLowerCase());
  }

  if (prepared.title && !prepared.seoTitle) {
    prepared.seoTitle = createSeoTitle(prepared.title);
  }

  if ((prepared.excerpt || prepared.content) && !prepared.seoDescription) {
    prepared.seoDescription = createSeoDescription(prepared.excerpt, prepared.content);
  }

  if (prepared.content && !prepared.readingTimeMinutes) {
    prepared.readingTimeMinutes = calculateReadingTime(prepared.content);
  }

  if (prepared.status === "published" && !prepared.publishedAt) {
    prepared.publishedAt = new Date();
  }

  return prepared;
}

async function ensureBlogSlug(payload, excludeId) {
  if (!payload.title && !payload.slug) {
    return payload;
  }

  const shouldRegenerate = Boolean(payload.slug || !excludeId);

  if (!shouldRegenerate) {
    return payload;
  }

  return {
    ...payload,
    slug: await createUniqueSlug({
      value: payload.title,
      providedSlug: payload.slug,
      exists: (slug) => blogRepository.findSlug(slug, excludeId),
    }),
  };
}

export const blogService = {
  async list(query, options = {}) {
    const result = await blogRepository.list(query, options);
    return {
      items: blogListDto(result.items),
      meta: result.meta,
    };
  },

  async getById(id) {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
    }
    return blogDto(blog);
  },

  async getBySlug(slug, options = {}) {
    const blog = await blogRepository.findBySlug(slug);

    if (!blog || (!options.includeUnpublished && blog.status !== "published")) {
      throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
    }

    return blogDto(blog);
  },

  async create(payload) {
    const prepared = prepareBlogPayload(await ensureBlogSlug(payload));
    const blog = await blogRepository.create(prepared);
    return blogDto(blog.toObject());
  },

  async update(id, payload) {
    const prepared = prepareBlogPayload(await ensureBlogSlug(payload, id));
    const blog = await blogRepository.updateById(id, prepared);

    if (!blog) {
      throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
    }

    return blogDto(blog);
  },

  async remove(id) {
    const blog = await blogRepository.deleteById(id);

    if (!blog) {
      throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
    }

    return blogDto(blog);
  },
};
