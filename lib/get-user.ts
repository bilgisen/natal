// lib/auth/get-user.ts
import { db } from "@/db/drizzle";
import { session, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserFromSession(token: string) {
  const [result] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    .from(session)
    .innerJoin(user, eq(session.userId, user.id))
    .where(eq(session.token, token))
    .limit(1);

  return result;
}
