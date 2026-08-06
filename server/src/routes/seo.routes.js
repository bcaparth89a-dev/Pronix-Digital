import { Router } from "express";
import { getImageSitemapXml, getRobotsTxt, getSitemapXml } from "../controllers/seo.controller.js";

export const seoRouter = Router();

seoRouter.get("/robots.txt", getRobotsTxt);
seoRouter.get("/sitemap.xml", getSitemapXml);
seoRouter.get("/sitemap-images.xml", getImageSitemapXml);
