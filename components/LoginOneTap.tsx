"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

// GoogleOneTap interface is now defined in types/global.d.ts

export default function LoginOneTap() {
  const { data } = authClient.useSession();
  const [initialized, setInitialized] = useState(false);

  // Cancel Google One Tap when user logs in
  useEffect(() => {
    if (data?.session?.userId) {
      // Use type assertion to help TypeScript
      const google = window.google as any;
      if (google?.accounts?.id?.cancel) {
        google.accounts.id.cancel();
      }
      setInitialized(false);
    }
  }, [data?.session?.userId]);

  // Initialize Google One Tap for logged out users
  useEffect(() => {
    if (data?.session?.userId) return; // Already logged in
    if (typeof window === "undefined") return;
    if (initialized) return; // Already initialized

    const scriptId = "google-one-tap";
    if (document.getElementById(scriptId)) {
      initGoogle();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, [data?.session?.userId, initialized]);

  // If user is already logged in, don't render anything
  if (data?.session?.userId) {
    return null;
  }

  function initGoogle() {
    // Use type assertion to help TypeScript
    const google = window.google as any;
    
    if (!google?.accounts?.id || initialized) return;
    
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    try {
      // Initialize Google One Tap
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: true,
        ux_mode: "popup",
        cancel_on_tap_outside: false,
      });

      // Show the One Tap prompt
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log("One Tap not displayed:", notification.getNotDisplayedReason?.() || 'Unknown reason');
        }
        if (notification.isDismissedMoment?.()) {
          console.log("One Tap dismissed:", notification.getDismissedReason?.() || 'User dismissed');
        }
      });

      setInitialized(true);
    } catch (error) {
      console.error("Error initializing Google One Tap:", error);
    }
  }

  async function handleCredentialResponse(response: GoogleCredentialResponse) {
    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => console.log("One Tap started"),
          onResponse: () => console.log("One Tap success"),
          onError: (ctx) => console.error("One Tap error:", ctx.error),
        }
      );
    } catch (err) {
      console.error("One Tap login failed:", err);
    }
  }

  return null; // No visual element
}
