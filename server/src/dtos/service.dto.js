export function serviceDto(service) {
  if (!service) return null;

  return {
    id: service._id?.toString(),
    icon: service.icon,
    title: service.title,
    description: service.description,
    longDescription: service.longDescription || "",
    order: service.order,
    isActive: service.isActive,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

export function serviceListDto(services) {
  return services.map(serviceDto);
}
