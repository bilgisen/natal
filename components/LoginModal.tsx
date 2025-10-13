"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  prompt_parent_id?: string;
  state_cookie_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  allowed_parent_origin?: string | string[];
}

interface GoogleOneTapNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (callback?: ((notification: GoogleOneTapNotification) => void) | undefined) => void;
        };
      };
    };
  }
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export default function LoginModal() {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(!session?.user);

  // Google One Tap integration
  useEffect(() => {
    if (session?.user) return; // Already logged in
    if (typeof window === "undefined") return;

    window.onload = function () {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          auto_select: true, // Auto show if user previously consented
        });
        window.google.accounts.id.prompt(); // Trigger the prompt
      }
    };
  }, [session]);

  // Google One Tap response callback
  const handleCredentialResponse = async (_response: GoogleCredentialResponse) => {
    // Google gives us only credential (JWT)
    // Trigger Better Auth popup login
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/",
      },
      {
        onRequest: () => {
          console.log("Google One Tap login initiated");
        },
        onResponse: () => {
          console.log("Google One Tap login completed");
          setOpen(false);
        },
        onError: (ctx) => {
          console.error("Google One Tap login failed:", ctx.error);
        },
      }
    );
  };

  const handleManualLogin = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/",
      },
      {
        onRequest: () => {
          console.log("Manual Google login initiated");
        },
        onResponse: () => {
          console.log("Manual Google login completed");
          setOpen(false);
        },
        onError: (ctx) => {
          console.error("Manual Google login failed:", ctx.error);
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {open && !session?.user && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center p-6 gap-4"
            >
              <h2 className="text-xl font-semibold text-center">
                Continue with Google
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                Sign in quickly with your Google account.
              </p>
              <Button
                onClick={handleManualLogin}
                className="w-full bg-white border text-black hover:bg-gray-50"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.5 0 6.3 1.2 8.3 3.4l6.1-6.1C34.3 3 29.6 1 24 1 14.8 1 6.9 6.5 3.3 14.4l7.1 5.5C12 13 17.5 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 2.8-2 5.2-4.3 6.8l6.6 5.1c3.8-3.5 6-8.7 6-16.4z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M10.4 28.9C9.7 27 9.3 25 9.3 23s.4-4 1.1-5.9L3.3 11.6C1.2 15.5 0 19.6 0 24s1.2 8.5 3.3 12.4l7.1-5.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M24 47c5.6 0 10.3-1.9 13.7-5.1l-6.6-5.1c-1.8 1.2-4.1 1.9-7.1 1.9-6.5 0-12-4.5-13.9-10.6l-7.1 5.5C6.9 41.5 14.8 47 24 47z"
                  />
                </svg>
                Sign in with Google
              </Button>
              <div
                id="g_id_onload"
                data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
              ></div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
