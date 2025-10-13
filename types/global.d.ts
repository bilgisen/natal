// Global type declaration for Google One Tap
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: ((notification: any) => void) | undefined) => void;
        };
      };
    };
  }
}
