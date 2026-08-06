import { seoService } from "../services/seo.service.js";

export async function getRobotsTxt(_req, res) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).send(seoService.buildRobotsTxt());
}

export async function getSitemapXml(_req, res) {
  const { xml } = await seoService.buildSitemap();
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=600");
  res.status(200).send(xml);
}

export async function getImageSitemapXml(_req, res) {
  const { imageXml } = await seoService.buildSitemap();
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=600");
  res.status(200).send(imageXml);
}
