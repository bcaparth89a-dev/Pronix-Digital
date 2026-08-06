export function metricDto(metric) {
  if (!metric) return null;

  return {
    id: metric._id?.toString(),
    label: metric.label,
    value: metric.value,
    order: metric.order,
    isActive: metric.isActive,
    createdAt: metric.createdAt,
    updatedAt: metric.updatedAt,
  };
}

export function metricListDto(metrics) {
  return metrics.map(metricDto);
}
