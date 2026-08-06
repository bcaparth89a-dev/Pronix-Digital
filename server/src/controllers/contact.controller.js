import { httpStatus } from "../constants/httpStatus.js";
import { contactService } from "../services/contact.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listContacts = asyncHandler(async (req, res) => {
  const result = await contactService.list(req.validated.query);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "Contacts fetched"));
});

export const getContactById = asyncHandler(async (req, res) => {
  const contact = await contactService.getById(req.validated.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, contact, "Contact fetched"));
});

export const createContact = asyncHandler(async (req, res) => {
  const requestMeta = {
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  };
  const contact = await contactService.create(req.validated.body, requestMeta);

  res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, contact, "Contact submitted"));
});

export const updateContactStatus = asyncHandler(async (req, res) => {
  const contact = await contactService.updateStatus(req.validated.params.id, req.validated.body.status);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, contact, "Contact status updated"));
});

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await contactService.remove(req.validated.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, contact, "Contact deleted"));
});

export const getContactsAnalytics = asyncHandler(async (req, res) => {
  const analytics = await contactService.getAnalytics();
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, analytics, "Contact analytics fetched"));
});

export const updateContactNotes = asyncHandler(async (req, res) => {
  const contact = await contactService.updateNotes(req.validated.params.id, req.validated.body.notes);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, contact, "Contact notes updated"));
});

export const bulkDeleteContacts = asyncHandler(async (req, res) => {
  await contactService.bulkDelete(req.validated.body.ids);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Contacts deleted in bulk"));
});

export const bulkUpdateContactsStatus = asyncHandler(async (req, res) => {
  await contactService.bulkUpdateStatus(req.validated.body.ids, req.validated.body.status);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Contacts status updated in bulk"));
});

