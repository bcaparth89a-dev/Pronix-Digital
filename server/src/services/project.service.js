import { httpStatus } from "../constants/httpStatus.js";
import { projectDto, projectListDto } from "../dtos/project.dto.js";
import { projectRepository } from "../repositories/project.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { createSeoDescription, createSeoTitle } from "../utils/seo.js";
import { createUniqueSlug } from "./slug.service.js";

function prepareProjectPayload(payload) {
  const prepared = { ...payload };

  if (prepared.title && !prepared.seoTitle) {
    prepared.seoTitle = createSeoTitle(prepared.title);
  }

  if ((prepared.summary || prepared.description) && !prepared.seoDescription) {
    prepared.seoDescription = createSeoDescription(prepared.summary, prepared.description);
  }

  if (prepared.status === "published" && !prepared.publishedAt) {
    prepared.publishedAt = new Date();
  }

  return prepared;
}

async function ensureProjectSlug(payload, excludeId) {
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
      exists: (slug) => projectRepository.findSlug(slug, excludeId),
    }),
  };
}

export const projectService = {
  async list(query, options = {}) {
    const result = await projectRepository.list(query, options);
    return {
      items: projectListDto(result.items),
      meta: result.meta,
    };
  },

  async getById(id) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
    }
    return projectDto(project);
  },

  async getBySlug(slug, options = {}) {
    const project = await projectRepository.findBySlug(slug);

    if (!project || (!options.includeUnpublished && project.status !== "published")) {
      throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
    }

    return projectDto(project);
  },

  async create(payload) {
    const prepared = prepareProjectPayload(await ensureProjectSlug(payload));
    const project = await projectRepository.create(prepared);
    return projectDto(project.toObject());
  },

  async update(id, payload) {
    const prepared = prepareProjectPayload(await ensureProjectSlug(payload, id));
    const project = await projectRepository.updateById(id, prepared);

    if (!project) {
      throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
    }

    return projectDto(project);
  },

  async remove(id) {
    const project = await projectRepository.deleteById(id);

    if (!project) {
      throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
    }

    return projectDto(project);
  },
};
