import { httpStatus } from "../constants/httpStatus.js";
import { faqService } from "../services/faq.service.js";
import { FAQ } from "../models/FAQ.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listFaqs = asyncHandler(async (req, res) => {
  const result = await faqService.list(req.validated.query, {
    includeInactive: req.user?.role === "admin",
  });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "FAQs fetched"));
});

export const getFaqById = asyncHandler(async (req, res) => {
  const faq = await faqService.getById(req.validated.params.id, {
    includeInactive: req.user?.role === "admin",
  });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, faq, "FAQ fetched"));
});

export const createFaq = asyncHandler(async (req, res) => {
  const maxFaq = await FAQ.findOne().sort("-sortOrder");
  const nextSortOrder = maxFaq ? (maxFaq.sortOrder || 0) + 1 : 1;

  const payload = {
    ...req.validated.body,
    sortOrder: nextSortOrder,
    order: nextSortOrder,
  };
  const faq = await faqService.create(payload);
  res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, faq, "FAQ created"));
});

export const updateFaq = asyncHandler(async (req, res) => {
  const faq = await faqService.update(req.validated.params.id, req.validated.body);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, faq, "FAQ updated"));
});

export const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await faqService.remove(req.validated.params.id);

  // Normalize remaining FAQ sortOrders starting from 1 with no gaps
  const remaining = await FAQ.find().sort("sortOrder order createdAt");
  for (let i = 0; i < remaining.length; i++) {
    remaining[i].sortOrder = i + 1;
    remaining[i].order = i + 1;
    await remaining[i].save();
  }

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, faq, "FAQ deleted"));
});

export const reorderFaqs = asyncHandler(async (req, res) => {
  const { orders } = req.validated.body;

  await Promise.all(
    orders.map(({ id, sortOrder }) =>
      FAQ.findByIdAndUpdate(id, { sortOrder, order: sortOrder }, { new: true })
    )
  );

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "FAQs reordered successfully"));
});
