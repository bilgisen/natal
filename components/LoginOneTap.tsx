// LoginOneTap component - Handles Google One Tap authentication
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export default function LoginOneTap() {
  const { data } = authClient.useSession();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data?.session?.userId) return; // zaten girişli
    if (typeof window === "undefined") return;

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
  }, [data]);

  function initGoogle() {
    if (!window.google?.accounts?.id || initialized) return;
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: true,
      ux_mode: "popup",
      cancel_on_tap_outside: false,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.log("One Tap not displayed:", notification.getNotDisplayedReason());
      }
      if (notification.isDismissedMoment()) {
        console.log("One Tap dismissed:", notification.getDismissedReason());
      }
    });

    setInitialized(true);
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

  return null; // Görsel element yok
}
