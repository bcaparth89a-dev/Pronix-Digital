import { httpStatus } from "../constants/httpStatus.js";
import { faqDto, faqListDto } from "../dtos/faq.dto.js";
import { faqRepository } from "../repositories/faq.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const faqService = {
  async list(query, options = {}) {
    const result = await faqRepository.list(query, options);
    return {
      items: faqListDto(result.items),
      meta: result.meta,
    };
  },

  async getById(id, options = {}) {
    const faq = await faqRepository.findById(id);

    if (!faq || (!options.includeInactive && !faq.isActive)) {
      throw new ApiError(httpStatus.NOT_FOUND, "FAQ not found");
    }

    return faqDto(faq);
  },

  async create(payload) {
    const faq = await faqRepository.create(payload);
    return faqDto(faq.toObject());
  },

  async update(id, payload) {
    const faq = await faqRepository.updateById(id, payload);

    if (!faq) {
      throw new ApiError(httpStatus.NOT_FOUND, "FAQ not found");
    }

    return faqDto(faq);
  },

  async remove(id) {
    const faq = await faqRepository.deleteById(id);

    if (!faq) {
      throw new ApiError(httpStatus.NOT_FOUND, "FAQ not found");
    }

    return faqDto(faq);
  },
};
