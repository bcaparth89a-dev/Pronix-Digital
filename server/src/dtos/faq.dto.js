export function faqDto(faq) {
  if (!faq) return null;

  return {
    id: faq._id?.toString(),
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    order: faq.order,
    isActive: faq.isActive,
    createdAt: faq.createdAt,
    updatedAt: faq.updatedAt,
  };
}

export function faqListDto(faqs) {
  return faqs.map(faqDto);
}

