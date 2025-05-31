// actions/auth-actions.ts

"use server";

import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/config/constants";
import { Log } from "@/utils/log";

interface SessionData {
  uid: string;
  token: string;
}

export async function createSession(data: SessionData) {
  (await cookies()).set(SESSION_COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // One day
    path: "/",
  });
}

export async function removeSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export const getAuthSession = async () => {
  const value = (await cookies()).get(SESSION_COOKIE_NAME)?.value || null;
  if (value) {
    try {
      return JSON.parse(value) as SessionData;
    } catch (error) {
      Log.error("Failed to parse session cookie:", error);
      return null;
    }
  }
  return null;
};
