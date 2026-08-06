import { httpStatus } from "../constants/httpStatus.js";
import { processChat } from "../services/chat.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Handle POST /api/v1/chat request.
 */
export const chatMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(new ApiResponse(httpStatus.BAD_REQUEST, null, "Message must be a non-empty string"));
  }

  const responseText = await processChat(message);

  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, { response: responseText }, "Response generated successfully"));
});
