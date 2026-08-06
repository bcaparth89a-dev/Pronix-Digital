import { httpStatus } from "../constants/httpStatus.js";
import { serviceDto, serviceListDto } from "../dtos/service.dto.js";
import { serviceRepository } from "../repositories/service.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

export const serviceService = {
  async list(query, options = {}) {
    const result = await serviceRepository.list(query, options);
    return {
      items: serviceListDto(result.items),
      meta: result.meta,
    };
  },

  async getById(id, options = {}) {
    const service = await serviceRepository.findById(id);

    if (!service || (!options.includeInactive && !service.isActive)) {
      throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
    }

    return serviceDto(service);
  },

  async create(payload) {
    const service = await serviceRepository.create(payload);
    return serviceDto(service.toObject());
  },

  async update(id, payload) {
    const service = await serviceRepository.updateById(id, payload);

    if (!service) {
      throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
    }

    return serviceDto(service);
  },

  async remove(id) {
    const service = await serviceRepository.deleteById(id);

    if (!service) {
      throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
    }

    return serviceDto(service);
  },

  async seedDefaultServices() {
    try {
      const count = await serviceRepository.model.countDocuments();
      if (count === 0) {
        logger.info("Seeding default homepage services...");
        const defaults = [
          {
            icon: "Globe",
            title: "Web Platforms",
            description: "High-conversion websites, custom frontends, portals, and responsive experiences.",
            longDescription: "We build modern, high-performance web applications tailored to your business needs. Leveraging the latest standards in React, Next.js, Node.js, and cloud ecosystems, our web platforms deliver lightning-fast load times, seamless responsiveness, and user experiences that captivate visitors. We focus on search engine optimization (SEO), robust authentication, intuitive navigation patterns, and secure payment integrations to ensure a frictionless transition from visitors to active clients.",
            order: 0,
          },
          {
            icon: "Smartphone",
            title: "Mobile Products",
            description: "Cross-platform iOS and Android apps with polished UX and reliable architecture.",
            longDescription: "Reach your audience wherever they are with premium cross-platform and native mobile applications. We design, prototype, and build beautiful mobile solutions using React Native, Flutter, and native mobile technologies. Our engineering covers offline capabilities, background sync, native push notifications, secure local storage, and integration with device APIs (such as biometrics and camera services). We build with scale in mind, facilitating clean, componentized codebases and simple submission to the Google Play Store and Apple App Store.",
            order: 1,
          },
          {
            icon: "Code2",
            title: "Custom Software",
            description: "Bespoke internal systems, API ecosystems, automation, and workflow modernization.",
            longDescription: "Replace fragmented legacy procedures and spreadsheets with bespoke internal applications tailored precisely to your operational workflows. From custom database management tools and secure API endpoints to ERP integrations, CRM structures, and automated scheduling systems, we design software that eliminates redundancies. We prioritize clean microservices architecture, strict security audits, automated testing pipelines, and detailed logging mechanisms to maximize stability.",
            order: 2,
          },
          {
            icon: "TrendingUp",
            title: "Growth Systems",
            description: "Search optimization, funnels, analytics infrastructure, and conversion optimization.",
            longDescription: "Scale your acquisition and drive measurable conversions with dedicated Growth Systems. We build analytics pipelines, integrate telemetry frameworks, design automated sales funnels, and construct search engine optimization architectures to turn visual layouts into high-performing conversion engines. Our data-driven methodology allows you to trace user flows, evaluate performance metrics, and dynamically deploy modifications based on real interactions rather than intuition.",
            order: 3,
          },
        ];
        await serviceRepository.model.create(defaults);
        logger.info("Default services successfully seeded.");
      }
    } catch (err) {
      logger.error("Failed to seed default services:", err);
    }
  },
};
