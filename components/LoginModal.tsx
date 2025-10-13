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

interface GoogleUserInfo {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export default function LoginModal() {
  const { data } = authClient.useSession();
  const [open, setOpen] = useState(!data?.session?.userId);
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'initial' | 'confirm'>('initial');
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  // Google One Tap integration - trigger immediately when modal opens
  useEffect(() => {
    if (data?.session?.userId) return; // Already logged in
    if (typeof window === "undefined") return; // Server-side check
    if (!open) return; // Modal is not open

    // Load Google script and initialize immediately
    loadGoogleScript();
  }, [data, open]);

  const loadGoogleScript = async () => {
    // Check if script is already loaded
    if (document.getElementById('google-identity-services-script')) {
      initializeGoogleOneTap();
      return;
    }

    // Check if Google is already available globally
    if (window.google?.accounts?.id) {
      initializeGoogleOneTap();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-identity-services-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Identity Services script loaded');
      // Small delay to ensure Google object is available
      setTimeout(initializeGoogleOneTap, 50);
    };

    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
    };

    document.head.appendChild(script);
  };

  const initializeGoogleOneTap = () => {
    if (!window.google?.accounts?.id || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      // Retry if Google is not ready yet
      if (!window.google?.accounts?.id) {
        setTimeout(initializeGoogleOneTap, 100);
        return;
      }
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: true,
        cancel_on_tap_outside: false,
        prompt_parent_id: 'google-one-tap-container',
        context: 'signin',
        state_cookie_domain: window.location.hostname,
        ux_mode: 'popup',
        allowed_parent_origin: window.location.origin,
      });

      setIsGoogleReady(true);

      // Immediately try to show the prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification) {
          if (notification.isNotDisplayed()) {
            console.log('One Tap not displayed:', notification.getNotDisplayedReason());
          } else if (notification.isSkippedMoment()) {
            console.log('One Tap skipped:', notification.getSkippedReason());
          } else if (notification.isDismissedMoment()) {
            console.log('One Tap dismissed:', notification.getDismissedReason());
          } else {
            console.log('One Tap prompt displayed successfully');
          }
        }
      });
    } catch (error) {
      console.error('Error initializing Google One Tap:', error);
      // Fallback: show manual button
      setIsGoogleReady(true);
    }
  };

  // Decode JWT token to get user information
  const decodeJWT = (token: string): GoogleUserInfo | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        sub: payload.sub,
      };
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Google One Tap response callback
  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    console.log("Received Google credential:", response.credential);

    // Decode the JWT to get user information
    const userInfo = decodeJWT(response.credential);
    if (userInfo) {
      setUserInfo(userInfo);
      setStep('confirm');
    }
  };

  const handleConfirmLogin = async () => {
    if (!userInfo) return;

    setIsLoading(true);
    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => {
            console.log("Google One Tap login initiated");
          },
          onResponse: () => {
            console.log("Google One Tap login completed");
            setOpen(false);
            setStep('initial');
            setUserInfo(null);
          },
          onError: (ctx) => {
            console.error("Google One Tap login failed:", ctx.error);
          },
        }
      );
    } catch (error) {
      console.error("Error during Google One Tap sign-in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLogin = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: "/dashboard",
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
    } catch (error) {
      console.error("Error during manual Google sign-in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && !data?.session?.userId && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-xl sm:max-w-md fixed top-4 right-4 left-auto bottom-auto translate-x-0 translate-y-0 [&>[data-radix-dialog-overlay]]:opacity-0 bg-card">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center p-6 gap-4"
            >
              {step === 'initial' && (
                <>
                  <div className="text-center w-full">
                    <h2 className="text-lg font-semibold mb-2">
                      Welcome back!
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Continue with your Google account
                    </p>
                  </div>

                  {/* Google One Tap Container - prominent placement */}
                  <div className="w-full">
                    <div
                      id="google-one-tap-container"
                      className="min-h-[120px] flex items-center justify-center bg-gray-50 rounded-lg p-4"
                    >
                      {!isGoogleReady && (
                        <div className="text-center text-muted-foreground">
                          <div className="animate-pulse">Loading...</div>
                        </div>
                      )}
                      {isGoogleReady && !userInfo && (
                        <div className="text-center text-sm text-muted-foreground">
                          <div className="mb-2">Select your Google account</div>
                          <div className="text-xs">One tap will appear here</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {userInfo && (
                    <>
                      <div className="text-center w-full">
                        <img
                          src={userInfo.picture}
                          alt={userInfo.name}
                          className="w-16 h-16 rounded-full mx-auto mb-3"
                        />
                        <h3 className="text-lg font-semibold">
                          Welcome back, {userInfo.name.split(' ')[0]}!
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {userInfo.email}
                        </p>
                      </div>

                      <Button
                        onClick={() => setStep('confirm')}
                        className="w-full"
                      >
                        Continue as {userInfo.name.split(' ')[0]}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setUserInfo(null);
                          // Re-trigger One Tap for different account
                          setTimeout(() => {
                            if (window.google?.accounts?.id) {
                              window.google.accounts.id.prompt();
                            }
                          }, 100);
                        }}
                        className="w-full"
                      >
                        Use different account
                      </Button>
                    </>
                  )}

                  <div className="flex items-center w-full">
                    <div className="flex-1 border-t"></div>
                    <span className="px-3 text-sm text-muted-foreground">or</span>
                    <div className="flex-1 border-t"></div>
                  </div>

                  <Button
                    onClick={handleManualLogin}
                    disabled={isLoading}
                    className="w-full bg-white border text-black hover:bg-gray-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    ) : (
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
                    )}
                    {isLoading ? 'Signing in...' : 'Sign in with Google'}
                  </Button>
                </>
              )}

              {step === 'confirm' && userInfo && (
                <>
                  <div className="text-center">
                    <img
                      src={userInfo.picture}
                      alt={userInfo.name}
                      className="w-16 h-16 rounded-full mx-auto mb-3"
                    />
                    <h2 className="text-xl font-semibold">
                      Welcome back, {userInfo.name.split(' ')[0]}!
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {userInfo.email}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    You're signing in as:
                  </p>

                  <div className="w-full p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={userInfo.picture}
                        alt={userInfo.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{userInfo.name}</p>
                        <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirmLogin}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Continue as ' + userInfo.name.split(' ')[0]
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('initial');
                      setUserInfo(null);
                    }}
                    className="w-full"
                  >
                    Use different account
                  </Button>
                </>
              )}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}