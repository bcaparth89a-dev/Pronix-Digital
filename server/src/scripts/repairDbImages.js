import { connectDatabase, disconnectDatabase } from "../db/mongoose.js";
import { Project } from "../models/Project.model.js";
import { Blog } from "../models/Blog.model.js";

// DRY_RUN is true by default unless explicitly set to "false"
const isDryRun = process.env.DRY_RUN !== "false";

function repairString(val) {
  if (typeof val !== "string") return val;
  let decoded = val;
  let prev;
  // Recursively decode ampersand and slash entity representations until string stops changing
  do {
    prev = decoded;
    decoded = decoded
      .replace(/&amp;/g, "&")
      .replace(/&#x2F;/gi, "/")
      .replace(/&#x27;/gi, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  } while (decoded !== prev);
  return decoded;
}

async function main() {
  console.info(`[Migration] Starting repair. Mode: ${isDryRun ? "DRY RUN (No writes)" : "WRITE (Modifying DB)"}`);
  await connectDatabase();

  let modifiedProjects = 0;
  let modifiedBlogs = 0;

  console.info("\n--- Checking Projects ---");
  const projects = await Project.find();
  for (const project of projects) {
    let changed = false;

    // Check coverImage
    if (project.coverImage) {
      if (project.coverImage.url) {
        const repairedUrl = repairString(project.coverImage.url);
        if (repairedUrl !== project.coverImage.url) {
          console.info(`[Project] ID: ${project._id} | Title: "${project.title}"`);
          console.info(`  - coverImage.url Old: ${project.coverImage.url}`);
          console.info(`  - coverImage.url New: ${repairedUrl}`);
          project.coverImage.url = repairedUrl;
          changed = true;
        }
      }
      if (project.coverImage.publicId) {
        const repairedPublicId = repairString(project.coverImage.publicId);
        if (repairedPublicId !== project.coverImage.publicId) {
          console.info(`  - coverImage.publicId Old: ${project.coverImage.publicId}`);
          console.info(`  - coverImage.publicId New: ${repairedPublicId}`);
          project.coverImage.publicId = repairedPublicId;
          changed = true;
        }
      }
    }

    // Check gallery array
    if (project.gallery && Array.isArray(project.gallery)) {
      project.gallery.forEach((item, idx) => {
        if (item.url) {
          const repaired = repairString(item.url);
          if (repaired !== item.url) {
            console.info(`  - gallery[${idx}].url Old: ${item.url}`);
            console.info(`  - gallery[${idx}].url New: ${repaired}`);
            item.url = repaired;
            changed = true;
          }
        }
        if (item.publicId) {
          const repaired = repairString(item.publicId);
          if (repaired !== item.publicId) {
            console.info(`  - gallery[${idx}].publicId Old: ${item.publicId}`);
            console.info(`  - gallery[${idx}].publicId New: ${repaired}`);
            item.publicId = repaired;
            changed = true;
          }
        }
      });
    }

    // Check projectUrl
    if (project.projectUrl) {
      const repaired = repairString(project.projectUrl);
      if (repaired !== project.projectUrl) {
        console.info(`  - projectUrl Old: ${project.projectUrl}`);
        console.info(`  - projectUrl New: ${repaired}`);
        project.projectUrl = repaired;
        changed = true;
      }
    }

    // Check githubUrl
    if (project.githubUrl) {
      const repaired = repairString(project.githubUrl);
      if (repaired !== project.githubUrl) {
        console.info(`  - githubUrl Old: ${project.githubUrl}`);
        console.info(`  - githubUrl New: ${repaired}`);
        project.githubUrl = repaired;
        changed = true;
      }
    }

    if (changed) {
      modifiedProjects++;
      if (!isDryRun) {
        // Mark fields as modified so Mongoose saves them
        project.markModified("coverImage");
        project.markModified("gallery");
        await project.save();
        console.info(`  [Saved] Successfully updated project document.`);
      }
    }
  }

  console.info("\n--- Checking Blogs ---");
  const blogs = await Blog.find();
  for (const blog of blogs) {
    let changed = false;

    // Check coverImage
    if (blog.coverImage) {
      if (blog.coverImage.url) {
        const repairedUrl = repairString(blog.coverImage.url);
        if (repairedUrl !== blog.coverImage.url) {
          console.info(`[Blog] ID: ${blog._id} | Title: "${blog.title}"`);
          console.info(`  - coverImage.url Old: ${blog.coverImage.url}`);
          console.info(`  - coverImage.url New: ${repairedUrl}`);
          blog.coverImage.url = repairedUrl;
          changed = true;
        }
      }
      if (blog.coverImage.publicId) {
        const repairedPublicId = repairString(blog.coverImage.publicId);
        if (repairedPublicId !== blog.coverImage.publicId) {
          console.info(`  - coverImage.publicId Old: ${blog.coverImage.publicId}`);
          console.info(`  - coverImage.publicId New: ${repairedPublicId}`);
          blog.coverImage.publicId = repairedPublicId;
          changed = true;
        }
      }
    }

    if (changed) {
      modifiedBlogs++;
      if (!isDryRun) {
        blog.markModified("coverImage");
        await blog.save();
        console.info(`  [Saved] Successfully updated blog document.`);
      }
    }
  }

  console.info(`\n[Summary] Scanning completed.`);
  console.info(`- Projects needing repair: ${modifiedProjects}`);
  console.info(`- Blogs needing repair: ${modifiedBlogs}`);
}

main()
  .catch((error) => {
    console.error("[Migration] Error during migration:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
