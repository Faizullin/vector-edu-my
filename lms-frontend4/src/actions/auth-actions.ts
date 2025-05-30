// actions/auth-actions.ts

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME, URLS } from "@/config/constants";

export async function createSession(uid: string) {
  (await cookies()).set(SESSION_COOKIE_NAME, uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // One day
    path: "/",
  });

  redirect(URLS.HOME);
}

export async function removeSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);

  redirect(URLS.ROOT);
}

export const getAuthSession = async () => {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value || null;
};
