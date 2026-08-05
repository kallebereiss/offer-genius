import { redirect } from "@tanstack/react-router";
import { getUser } from "./auth.functions";

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    throw redirect({ to: "/login" });
  }
  return user;
}
