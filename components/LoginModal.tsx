// components/LoginModal.tsx
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// Define the Google One Tap types
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

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

// DO NOT declare 'google' on the Window interface here as it conflicts with better-auth.
// If you need specific types for Google's API, consider using type assertions when accessing window.google.
// declare global {
//   interface Window {
//     google?: {
//       accounts: {
//         id: {
//           initialize: (config: GoogleOneTapConfig) => void;
//           prompt: (callback?: (notification: GoogleOneTapNotification) => void) => void;
//           renderButton: (element: HTMLElement, options: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
//         };
//       };
//     };
//   }
// }

export default function LoginModal() {
  const { data } = authClient.useSession(); // Get the full data object

  // Check for session existence and specifically for a userId (or other identifying property)
  // Replace 'userId' with the correct property name if different in your better-auth setup
  const [open, setOpen] = useState(!data?.session?.userId); // Assuming session object has userId

  // Google One Tap integration
  useEffect(() => {
    if (data?.session?.userId) return; // Already logged in, based on corrected check
    if (typeof window === "undefined") return; // Server-side check

    // Dynamically load the Google Identity Services script if not present
    const scriptId = 'google-identity-services-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Identity Services script loaded.');
        // Initialize after script is loaded
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: handleCredentialResponse,
            auto_select: true, // Auto show if user previously consented
          });
          // Note: prompt() might require user interaction in some browsers now
          // Consider showing a button first, or calling prompt() on a user gesture
          // window.google.accounts.id.prompt(); // Trigger the prompt
        } else {
          console.error('Google Identity Services failed to load correctly.');
        }
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script.');
      };
      document.head.appendChild(script);
    } else {
      // Script already exists, try to initialize if possible
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          auto_select: true,
        });
        // window.google.accounts.id.prompt(); // Consider user gesture requirement
      }
    }

  }, [data]); // Depend on data to re-run if session changes


  // Google One Tap response callback
  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    console.log("Received Google credential:", response.credential);
    // Google gives us only credential (JWT)
    // Trigger Better Auth popup login
    try {
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
            // setOpen(false); // State will update via useSession hook
          },
          onError: (ctx) => {
            console.error("Google One Tap login failed:", ctx.error);
          },
        }
      );
    } catch (error) {
      console.error("Error during Google One Tap sign-in:", error);
    }
  };

  const handleManualLogin = async () => {
    try {
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
            // setOpen(false); // State will update via useSession hook
          },
          onError: (ctx) => {
            console.error("Manual Google login failed:", ctx.error);
          },
        }
      );
    } catch (error) {
      console.error("Error during manual Google sign-in:", error);
    }
  };

  return (
    <AnimatePresence>
      {/* Check for the correct session property, e.g., userId */}
      {open && !data?.session?.userId && (
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
              {/* Optional: Container for the One Tap prompt if loaded dynamically */}
              {/* <div id="g_id_onload" data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}></div> */}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}