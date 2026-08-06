export function projectDto(project) {
  if (!project) return null;

  return {
    id: project._id?.toString(),
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    description: project.description,
    clientName: project.clientName,
    industry: project.industry,
    services: project.services || [],
    technologies: project.technologies || [],
    coverImage: project.coverImage,
    gallery: project.gallery || [],
    projectUrl: project.projectUrl,
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
    status: project.status,
    isFeatured: project.isFeatured,
    publishedAt: project.publishedAt,
    problem: project.problem,
    solution: project.solution,
    results: project.results,
    githubUrl: project.githubUrl,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export function projectListDto(projects) {
  return projects.map(projectDto);
}
