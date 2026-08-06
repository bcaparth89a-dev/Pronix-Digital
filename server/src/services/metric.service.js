import { httpStatus } from "../constants/httpStatus.js";
import { metricDto, metricListDto } from "../dtos/metric.dto.js";
import { metricRepository } from "../repositories/metric.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

export const metricService = {
  async list(query, options = {}) {
    const result = await metricRepository.list(query, options);
    return {
      items: metricListDto(result.items),
      meta: result.meta,
    };
  },

  async getById(id, options = {}) {
    const metric = await metricRepository.findById(id);

    if (!metric || (!options.includeInactive && !metric.isActive)) {
      throw new ApiError(httpStatus.NOT_FOUND, "Metric not found");
    }

    return metricDto(metric);
  },

  async create(payload) {
    const metric = await metricRepository.create(payload);
    return metricDto(metric.toObject());
  },

  async update(id, payload) {
    const metric = await metricRepository.updateById(id, payload);

    if (!metric) {
      throw new ApiError(httpStatus.NOT_FOUND, "Metric not found");
    }

    return metricDto(metric);
  },

  async remove(id) {
    const metric = await metricRepository.deleteById(id);

    if (!metric) {
      throw new ApiError(httpStatus.NOT_FOUND, "Metric not found");
    }

    return metricDto(metric);
  },

  async seedDefaultMetrics() {
    try {
      const count = await metricRepository.model.countDocuments();
      if (count === 0) {
        logger.info("Seeding default homepage metrics...");
        const defaults = [
          { value: "20+", label: "Projects Delivered", order: 0 },
          { value: "15+", label: "Client Partnerships", order: 1 },
          { value: "2+", label: "Years Building", order: 2 },
          { value: "100%", label: "Delivery Satisfaction", order: 3 },
        ];
        await metricRepository.model.create(defaults);
        logger.info("Default metrics successfully seeded.");
      }
    } catch (err) {
      logger.error("Failed to seed default metrics:", err);
    }
  },
};
