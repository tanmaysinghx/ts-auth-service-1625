import { Request, Response } from "express";
import {
  storeSessionService,
  getUserSessionsService,
  revokeSessionService,
  verifySessionStatusService,
} from "../services/sessionService";
import { errorResponse, successResponse } from "../utils/responseUtils";
import geoip from "geoip-lite";
import requestIp from "request-ip";

/* Controller to store session metadata (IP, Device, Location) */
export const storeSession = async (req: Request, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(401)
        .json(errorResponse("User not authenticated", "Auth Error", transactionId));
    }

    // 1. Get IP Address automatically
    const ipAddress =
      requestIp.getClientIp(req) || req.socket.remoteAddress || "";

    // 2. Get Location from IP
    const geo = geoip.lookup(ipAddress);

    // If running on localhost (127.0.0.1), geo will be null.
    // Fallback to the 'location' sent from the client (Timezone) or "Unknown"
    const detectedLocation = geo
      ? `${geo.city}, ${geo.country}`
      : req.body.location;

    // 3. Extract other metadata from body
    const { refreshToken, device, browser, os } = req.body;

    // 4. Call Service
    const session = await storeSessionService({
      userId,
      refreshToken,
      ipAddress,
      location: detectedLocation,
      device,
      browser,
      os,
      userAgent: req.headers["user-agent"],
    });

    return res
      .status(201)
      .json(successResponse(session, "Session stored", transactionId));
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to store session";
    return res
      .status(500)
      .json(errorResponse(errorMessage, "Store Session Error", transactionId));
  }
};

/* Controller to get all active sessions for the logged-in user */
export const getSessions = async (req: Request, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const userId = req.user?.userId;
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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch sessions";
    return res
      .status(500)
      .json(errorResponse(errorMessage, "Fetch Session Error", transactionId));
  }
};

/* Controller to revoke (logout) a specific session */
export const revokeSession = async (req: Request, res: Response) => {
  const transactionId = req.transactionId;
  try {
    const userId = req.user?.userId;
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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to revoke session";

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
export const validateSession = async (req: Request, res: Response) => {
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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Validation failed";
    return res
      .status(400)
      .json(errorResponse(errorMessage, "Validation Error", transactionId));
  }
};
