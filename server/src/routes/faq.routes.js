import { Router } from "express";
import { createFaq, deleteFaq, getFaqById, listFaqs, updateFaq, reorderFaqs } from "../controllers/faq.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { optionalAuthenticate } from "../middlewares/optionalAuthenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  createFaqSchema,
  faqIdSchema,
  listFaqsSchema,
  updateFaqSchema,
  reorderFaqsSchema,
} from "../validators/faq.validator.js";
import { cacheMiddleware, clearCacheMiddleware } from "../middlewares/cache.middleware.js";

export const faqRouter = Router();

faqRouter.get("/", optionalAuthenticate, validate(listFaqsSchema), cacheMiddleware(300, "faqs"), listFaqs);
faqRouter.patch("/reorder", authenticate, authorize("admin"), validate(reorderFaqsSchema), clearCacheMiddleware("faqs"), reorderFaqs);
faqRouter.get("/:id", optionalAuthenticate, validate(faqIdSchema), getFaqById);
faqRouter.post("/", authenticate, authorize("admin"), validate(createFaqSchema), clearCacheMiddleware("faqs"), createFaq);
faqRouter.patch("/:id", authenticate, authorize("admin"), validate(updateFaqSchema), clearCacheMiddleware("faqs"), updateFaq);
faqRouter.delete("/:id", authenticate, authorize("admin"), validate(faqIdSchema), clearCacheMiddleware("faqs"), deleteFaq);
