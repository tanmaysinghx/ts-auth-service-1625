import { Session } from "@prisma/client";
import prisma from "../config/db";

/* Function to store session metadata after login */
export const storeSessionService = async (data: {
  userId: string;
  refreshToken: string;
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
  userAgent?: string;
}) => {
  const {
    userId,
    refreshToken,
    ipAddress,
    device,
    browser,
    os,
    location,
    userAgent,
  } = data;

  if (!userId || !refreshToken) {
    throw new Error(
      "User ID and Refresh Token are required to create a session."
    );
  }

  // Calculate expiration (Default: 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Now 'prisma.session' will be recognized
  const session = await prisma.session.create({
    data: {
      userId,
      refreshToken,
      ipAddress,
      device,
      browser,
      os,
      location,
      userAgent,
      expiresAt,
      isActive: true,
    },
  });

  return session;
};

/* Function to get all active sessions for a user */
export const getUserSessionsService = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { lastActiveAt: "desc" },
    select: {
      id: true,
      ipAddress: true,
      device: true,
      browser: true,
      os: true,
      location: true,
      isActive: true,
      lastActiveAt: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  return sessions;
};

/* Function to revoke (deactivate) a specific session */
export const revokeSessionService = async (data: {
  sessionId: string;
  userId: string;
}) => {
  const { sessionId, userId } = data;

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw new Error("Session not found or access denied.");
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { isActive: false },
  });

  return "Session deactivated successfully";
};

/* Function to find a session by refresh token */
export const findSessionByTokenService = async (refreshToken: string) => {
  const session = await prisma.session.findUnique({
    where: { refreshToken },
  });

  if (!session) {
    throw new Error("Session not found.");
  }
  return session;
};

/* Function to update last active time */
export const touchSessionService = async (sessionId: string) => {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastActiveAt: new Date() },
    });
  } catch (e) {
    // Ignore errors if session was deleted concurrently
  }
};

/* Function to check if a session is valid, revoked, or expired */
export const verifySessionStatusService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required for validation");
  }

  const session = await prisma.session.findUnique({
    where: { refreshToken },
  });

  if (!session) {
    return {
      isValid: false,
      status: "NOT_FOUND",
      message: "Session does not exist",
    };
  }

  if (!session.isActive) {
    return {
      isValid: false,
      status: "REVOKED",
      message: "Session has been terminated",
    };
  }

  if (new Date() > session.expiresAt) {
    return {
      isValid: false,
      status: "EXPIRED",
      message: "Session has expired",
    };
  }

  // If valid, we can update the lastActiveAt time here to keep it fresh
  await prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  return { isValid: true, status: "ACTIVE", message: "Session is valid" };
};
