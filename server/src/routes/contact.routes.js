import { Router } from "express";
import {
  createContact,
  deleteContact,
  getContactById,
  listContacts,
  updateContactStatus,
} from "../controllers/contact.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import {
  contactIdSchema,
  createContactSchema,
  listContactsSchema,
  updateContactStatusSchema,
} from "../validators/contact.validator.js";
import { contactLimiter } from "../config/rateLimiter.js";

export const contactRouter = Router();

contactRouter.post("/", contactLimiter, validate(createContactSchema), createContact);
contactRouter.get("/", authenticate, authorize("admin"), validate(listContactsSchema), listContacts);
contactRouter.get("/:id", authenticate, authorize("admin"), validate(contactIdSchema), getContactById);
contactRouter.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  validate(updateContactStatusSchema),
  updateContactStatus,
);
contactRouter.delete("/:id", authenticate, authorize("admin"), validate(contactIdSchema), deleteContact);

