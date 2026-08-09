import { connectDatabase, disconnectDatabase } from "../db/mongoose.js";
import { Project } from "../models/Project.model.js";
import { Blog } from "../models/Blog.model.js";

async function main() {
  await connectDatabase();

  console.info("=== PROJECTS ===");
  const projects = await Project.find().lean();
  for (const p of projects) {
    console.info(`Project: "${p.title}"`);
    console.info(`- coverImage:`, p.coverImage);
    console.info(`- has coverImage.url:`, !!p.coverImage?.url);
    console.info(`- has coverImage.publicId:`, !!p.coverImage?.publicId);
  }

  console.info("\n=== BLOGS ===");
  const blogs = await Blog.find().lean();
  for (const b of blogs) {
    console.info(`Blog: "${b.title}"`);
    console.info(`- coverImage:`, b.coverImage);
    console.info(`- has coverImage.url:`, !!b.coverImage?.url);
    console.info(`- has coverImage.publicId:`, !!b.coverImage?.publicId);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
