import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { RootLayout } from "@/layouts/RootLayout";
import { GlobalErrorBoundary } from "@/components/public/GlobalErrorBoundary";
import { publicRoutes, privateRoutes } from "@/config/navigation";
import { AdminProtectedRoute } from "@/routes/AdminProtectedRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ThemeProvider } from "@/providers/ThemeProvider";



// Dynamic routing page loader helper
const lazyLoad = (importFunc, componentName) => {
  const LazyComp = lazy(() => importFunc().then((module) => ({ default: module[componentName] })));
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LazyComp />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      // Public website routes
      {
        element: <PublicLayout />,
        children: [
          { path: publicRoutes.home, element: lazyLoad(() => import("@/pages/public/HomePage"), "HomePage") },
          { path: publicRoutes.about, element: lazyLoad(() => import("@/pages/public/AboutPage"), "AboutPage") },
          { path: publicRoutes.services, element: lazyLoad(() => import("@/pages/public/ServicesPage"), "ServicesPage") },
          { path: publicRoutes.faqs, element: <Navigate to="/#faqs" replace /> },
          { path: publicRoutes.portfolio, element: lazyLoad(() => import("@/pages/public/PortfolioPage"), "PortfolioPage") },
          { path: "/portfolio/:slug", element: lazyLoad(() => import("@/pages/public/PortfolioDetailPage"), "PortfolioDetailPage") },
          { path: publicRoutes.blog, element: lazyLoad(() => import("@/pages/public/BlogListingPage"), "BlogListingPage") },
          { path: "/blog/:slug", element: lazyLoad(() => import("@/pages/public/BlogDetailPage"), "BlogDetailPage") },
          { path: publicRoutes.contact, element: lazyLoad(() => import("@/pages/public/ContactPage"), "ContactPage") },
          { path: publicRoutes.privacy, element: lazyLoad(() => import("@/pages/public/PrivacyPolicyPage"), "PrivacyPolicyPage") },
          { path: publicRoutes.terms, element: lazyLoad(() => import("@/pages/public/TermsPage"), "TermsPage") },
        ],
      },
      // Auth routes
      {
        element: <AuthProvider><ThemeProvider><AuthLayout /></ThemeProvider></AuthProvider>,
        children: [
          { path: publicRoutes.adminLogin, element: lazyLoad(() => import("@/pages/admin/AdminLoginPage"), "AdminLoginPage") }
        ],
      },
      // Admin routes
      {
        element: <AuthProvider><ThemeProvider><AdminProtectedRoute /></ThemeProvider></AuthProvider>,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: privateRoutes.adminDashboard, element: lazyLoad(() => import("@/pages/admin/AdminDashboardPage"), "AdminDashboardPage") },
              { path: privateRoutes.adminProjects, element: lazyLoad(() => import("@/pages/admin/projects/AdminProjectsPage"), "AdminProjectsPage") },
              { path: "/admin/projects/new", element: lazyLoad(() => import("@/pages/admin/projects/AdminProjectCreatePage"), "AdminProjectCreatePage") },
              { path: "/admin/projects/:id/edit", element: lazyLoad(() => import("@/pages/admin/projects/AdminProjectEditPage"), "AdminProjectEditPage") },
              { path: "/admin/projects/:id", element: lazyLoad(() => import("@/pages/admin/projects/AdminProjectViewPage"), "AdminProjectViewPage") },
              { path: privateRoutes.adminBlogs, element: lazyLoad(() => import("@/pages/admin/blogs/AdminBlogsPage"), "AdminBlogsPage") },
              { path: "/admin/blogs/new", element: lazyLoad(() => import("@/pages/admin/blogs/AdminBlogCreatePage"), "AdminBlogCreatePage") },
              { path: "/admin/blogs/:id/edit", element: lazyLoad(() => import("@/pages/admin/blogs/AdminBlogEditPage"), "AdminBlogEditPage") },
              { path: "/admin/blogs/:id", element: lazyLoad(() => import("@/pages/admin/blogs/AdminBlogPreviewPage"), "AdminBlogPreviewPage") },
              { path: privateRoutes.adminFaqs, element: lazyLoad(() => import("@/pages/admin/faqs/AdminFaqsPage"), "AdminFaqsPage") },
              { path: privateRoutes.adminContacts, element: lazyLoad(() => import("@/pages/admin/contacts/AdminContactsPage"), "AdminContactsPage") },
              { path: privateRoutes.adminUsers, element: lazyLoad(() => import("@/pages/admin/users/AdminUsersPage"), "AdminUsersPage") },
              { path: privateRoutes.adminSettings, element: lazyLoad(() => import("@/pages/admin/AdminSettingsPage"), "AdminSettingsPage") },
              { path: "/admin/*", element: <Navigate to={privateRoutes.adminDashboard} replace /> },
            ],
          },
        ],
      },
      // User dashboard routes
      {
        element: <AuthProvider><ThemeProvider><ProtectedRoute /></ThemeProvider></AuthProvider>,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: privateRoutes.dashboard,
                element: <Navigate to={publicRoutes.home} replace />,
              },
            ],
          },
        ],
      },
      // 404
      { path: "*", element: lazyLoad(() => import("@/pages/public/NotFoundPage"), "NotFoundPage") },
    ],
  },
]);
