import { httpStatus } from "../constants/httpStatus.js";
import { Blog } from "../models/Blog.model.js";
import { Contact } from "../models/Contact.model.js";
import { FAQ } from "../models/FAQ.model.js";
import { Project } from "../models/Project.model.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    projectsTotal,
    projectsPublished,
    blogsTotal,
    blogsPublished,
    faqsTotal,
    contactsTotal,
    contactsNew,
    usersTotal,
    recentContacts,
    recentBlogs,
  ] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ status: "published" }),
    Blog.countDocuments(),
    Blog.countDocuments({ status: "published" }),
    FAQ.countDocuments(),
    Contact.countDocuments(),
    Contact.countDocuments({ status: "new" }),
    User.countDocuments(),
    Contact.find().sort({ createdAt: -1 }).limit(5).lean(),
    Blog.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const data = {
    projects: { total: projectsTotal, published: projectsPublished },
    blogs: { total: blogsTotal, published: blogsPublished },
    faqs: { total: faqsTotal },
    contacts: { total: contactsTotal, new: contactsNew },
    users: { total: usersTotal },
    recentContacts: recentContacts.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      status: c.status,
      createdAt: c.createdAt,
    })),
    recentBlogs: recentBlogs.map((b) => ({
      id: b._id.toString(),
      title: b.title,
      status: b.status,
      category: b.category,
      createdAt: b.createdAt,
    })),
  };

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, data, "Dashboard stats fetched"));
});
