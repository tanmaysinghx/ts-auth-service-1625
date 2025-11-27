import { Request, Response } from "express";
import {
  storeSessionService,
  getUserSessionsService,
  revokeSessionService,
  verifySessionStatusService,
} from "../services/sessionService";
import { errorResponse, successResponse } from "../utils/responseUtils";

interface CustomRequest extends Request {
  transactionId?: string;
  user?: any;
}

/* Controller to store session metadata (IP, Device, Location) */
export const storeSession = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  try {
    // 1. Extract User ID (Assuming Auth Middleware has run)
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json(
          errorResponse("User not authenticated", "Auth Error", transactionId)
        );
    }

    // 2. Extract Metadata (Body has priority, fallback to Headers)
    const { refreshToken, location, device, browser, os } = req.body;

    const ipAddress = req.body.ipAddress || req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // 3. Call Service
    const session = await storeSessionService({
      userId,
      refreshToken,
      ipAddress,
      device,
      browser,
      os,
      location,
      userAgent,
    });

    return res
      .status(201)
      .json(
        successResponse(
          session,
          "Session metadata stored successfully",
          transactionId
        )
      );
  } catch (err: any) {
    // Handle case where session already exists for this token
    if (err.message && err.message.includes("already exists")) {
      // We return 200 or 201 here because from client perspective, it's fine
      return res
        .status(200)
        .json(successResponse(null, "Session already active", transactionId));
    }

    const errorMessage = err?.message || "Failed to store session";
    return res
      .status(500)
      .json(errorResponse(errorMessage, "Session Store Error", transactionId));
  }
};

/* Controller to get all active sessions for the logged-in user */
export const getSessions = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json(
          errorResponse("User not authenticated", "Auth Error", transactionId)
        );
    }

    const sessions = await getUserSessionsService(userId);

    return res
      .status(200)
      .json(
        successResponse(
          sessions,
          "Active sessions fetched successfully",
          transactionId
        )
      );
  } catch (err: any) {
    const errorMessage = err?.message || "Failed to fetch sessions";
    return res
      .status(500)
      .json(errorResponse(errorMessage, "Fetch Session Error", transactionId));
  }
};

/* Controller to revoke (logout) a specific session */
export const revokeSession = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id: sessionId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json(
          errorResponse("User not authenticated", "Auth Error", transactionId)
        );
    }

    const message = await revokeSessionService({ sessionId, userId });

    return res
      .status(200)
      .json(
        successResponse(message, "Session revoked successfully", transactionId)
      );
  } catch (err: any) {
    const errorMessage = err?.message || "Failed to revoke session";

    if (
      errorMessage.includes("not found") ||
      errorMessage.includes("access denied")
    ) {
      return res
        .status(404)
        .json(errorResponse(errorMessage, "Revoke Error", transactionId));
    }

    return res
      .status(500)
      .json(errorResponse(errorMessage, "Revoke Session Error", transactionId));
  }
};

/* Controller to validate if a refresh token is still active */
export const validateSession = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const { refreshToken } = req.body;

    const result = await verifySessionStatusService(refreshToken);

    // We return 200 OK even if invalid, because the check itself succeeded
    return res
      .status(200)
      .json(
        successResponse(result, "Session validation completed", transactionId)
      );
  } catch (err: any) {
    const errorMessage = err?.message || "Validation failed";
    return res
      .status(400)
      .json(errorResponse(errorMessage, "Validation Error", transactionId));
  }
};
