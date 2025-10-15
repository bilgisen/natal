import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user, account } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth"; // betterAuth instance
import { authClient } from "@/lib/auth-client";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
      const { credential } = await req.json();
  
      if (!credential) {
        return NextResponse.json({ error: "Missing credential" }, { status: 400 });
      }
  
      // 1️⃣ Google token doğrulaması
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
      );
  
      if (!verifyRes.ok) {
        return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
      }
  
      const googleData = await verifyRes.json();
  
      const googleId = googleData.sub;
      const email = googleData.email;
      const name = googleData.name;
      const image = googleData.picture;
      const aud = googleData.aud;
  
      if (aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        return NextResponse.json({ error: "Invalid audience" }, { status: 403 });
      }
  
      if (!googleId || !email) {
        return NextResponse.json({ error: "Incomplete Google data" }, { status: 400 });
      }
  
      // 2️⃣ DB’de kullanıcıyı bul veya oluştur
      let existingUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });
  
      if (!existingUser) {
        const id = randomUUID();
        const [newUser] = await db
          .insert(user)
          .values({
            id,
            name: name || "Google User",
            email,
            emailVerified: true,
            image,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
  
        existingUser = newUser;
  
        await db.insert(account).values({
          id: randomUUID(),
          userId: newUser.id,
          accountId: googleId,
          providerId: "google",
          idToken: credential,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        await db
          .update(user)
          .set({
            image: image || existingUser.image,
            updatedAt: new Date(),
          })
          .where(eq(user.id, existingUser.id));
      }
  
      // 3️⃣ Create a session using the auth client
      const signInResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/signin/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credential,
          redirect: false
        })
      });
  
      if (!signInResponse.ok) {
        const error = await signInResponse.json().catch(() => ({}));
        console.error('Failed to create session:', error);
        return NextResponse.json({ error: error.message || 'Failed to create session' }, { status: signInResponse.status });
      }
  
      // 4️⃣ Get the user data to return
      const res = NextResponse.json({
        success: true,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        },
      });
  
      // Copy the session cookie from the response
      const setCookie = signInResponse.headers.get('set-cookie');
      if (setCookie) {
        res.headers.set('set-cookie', setCookie);
      }
  
      return res;
    } catch (err) {
      console.error("🔥 Google One Tap backend error:", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }