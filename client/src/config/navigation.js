export const publicRoutes = {
  home: "/",
  login: "/login",
  adminLogin: "/admin/login",
  about: "/about",
  services: "/services",
  faqs: "/faqs",
  portfolio: "/portfolio",
  portfolioDetail: (slug) => `/portfolio/${slug}`,
  blog: "/blog",
  blogDetail: (slug) => `/blog/${slug}`,
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
};

export const privateRoutes = {
  dashboard: "/dashboard",
  adminDashboard: "/admin",
  adminProjects: "/admin/projects",
  adminBlogs: "/admin/blogs",
  adminFaqs: "/admin/faqs",
  adminContacts: "/admin/contacts",
  adminUsers: "/admin/users",
  adminSettings: "/admin/settings",
  adminWorkManagement: "/admin/work-management",
  adminProjectCreate: "/admin/projects/new",
  adminProjectEdit: (id) => `/admin/projects/${id}/edit`,
  adminProjectView: (id) => `/admin/projects/${id}`,
  adminBlogCreate: "/admin/blogs/new",
  adminBlogEdit: (id) => `/admin/blogs/${id}/edit`,
  adminBlogView: (id) => `/admin/blogs/${id}`,
};

