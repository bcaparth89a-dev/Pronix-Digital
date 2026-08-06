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

