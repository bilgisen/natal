// Global type declaration for Google One Tap
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
            itp_support?: boolean;
          }) => void;
          prompt: (notification?: (notification: {
            isNotDisplayed: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getDismissedReason: () => string;
          }) => void) => void;
          cancel: () => void;
          renderButton: (element: HTMLElement, options: any) => void;
          revoke: (hint: string, callback?: () => void) => void;
        };
      };
    };
  }
}
