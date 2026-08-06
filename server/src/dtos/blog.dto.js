export function blogDto(blog) {
  if (!blog) return null;

  return {
    id: blog._id?.toString(),
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    category: blog.category,
    tags: blog.tags || [],
    author: blog.author,
    coverImage: blog.coverImage,
    status: blog.status,
    isFeatured: blog.isFeatured,
    publishedAt: blog.publishedAt,
    readingTimeMinutes: blog.readingTimeMinutes,
    seoTitle: blog.seoTitle,
    seoDescription: blog.seoDescription,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}

export function blogListDto(blogs) {
  return blogs.map(blogDto);
}
