"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_DURATION * 1000 }); // expires in 7 days
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax"
  });
};

export async function signUp(params: SignUpParams) {
  try {
    const { uid, name, email } = params;
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) return { success: false, message: "User already exists. Please sign in instead." };

    await db.collection("users").doc(uid).set({ name, email });

    return { success: true, message: "Account created successfully. Please sign in." };
  } catch (error: any) {
    console.error("Error creating a user", error);
    if (error.code === "auth/email-already-exists") {
      return { success: false, message: "This email is already in use." };
    }
    return { success: false, message: "Failed to create an account." };
  }
};

export async function signIn(params: SignInParams) {
  try {
    const { email, idToken } = params;
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) return { success: false, message: "User not found. Create an account instead." };
    await setSessionCookie(idToken);
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to login." };
  }
};

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db.collection("users").doc(decodedClaims.uid).get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id
    } as User;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user ? user : null;
};
