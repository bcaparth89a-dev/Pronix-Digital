import { Router } from "express";
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogBySlug,
  listBlogs,
  updateBlog,
  reorderBlogs,
} from "../controllers/blog.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { optionalAuthenticate } from "../middlewares/optionalAuthenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  blogIdSchema,
  blogSlugSchema,
  createBlogSchema,
  listBlogsSchema,
  updateBlogSchema,
  reorderSchema,
} from "../validators/blog.validator.js";
import { cacheMiddleware, clearCacheMiddleware } from "../middlewares/cache.middleware.js";

export const blogRouter = Router();

blogRouter.get("/", optionalAuthenticate, validate(listBlogsSchema), cacheMiddleware(300, "blogs"), listBlogs);
blogRouter.get("/by-id/:id", authenticate, authorize("admin"), validate(blogIdSchema), getBlogById);
blogRouter.patch("/reorder", authenticate, authorize("admin"), validate(reorderSchema), clearCacheMiddleware("blogs"), reorderBlogs);
blogRouter.get("/:slug", optionalAuthenticate, validate(blogSlugSchema), cacheMiddleware(300, "blogs"), getBlogBySlug);
blogRouter.post("/", authenticate, authorize("admin"), validate(createBlogSchema), clearCacheMiddleware("blogs"), createBlog);
blogRouter.patch("/:id", authenticate, authorize("admin"), validate(updateBlogSchema), clearCacheMiddleware("blogs"), updateBlog);
blogRouter.delete("/:id", authenticate, authorize("admin"), validate(blogIdSchema), clearCacheMiddleware("blogs"), deleteBlog);
