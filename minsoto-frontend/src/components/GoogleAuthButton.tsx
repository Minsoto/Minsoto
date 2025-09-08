'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { AxiosError } from 'axios';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Google One Tap response type
interface GoogleCredentialResponse {
  clientId: string;
  credential: string; // JWT ID token
  select_by: string;
}

export default function GoogleAuthButton({ onSuccess, onError }: GoogleAuthButtonProps) {
  const { login } = useAuthStore();

  // Handles Google response safely
  const handleGoogleResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        console.log('Google response received');

        // Send JWT ID token to backend
        const result = await api.post('/auth/google/', {
          access_token: response.credential,
        });

        console.log('Backend response:', result.data);

        const { tokens, user } = result.data;

        login(tokens, user);
        onSuccess?.();
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        console.error('Google auth error:', axiosError);
        console.error('Error response:', axiosError.response?.data);

        const errorMessage =
          axiosError.response?.data?.error || 'Authentication failed';
        onError?.(errorMessage);
      }
    },
    [login, onSuccess, onError]
  );

  // Initialize Google One Tap
  const initializeGoogleAuth = useCallback(() => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button')!,
        {
          theme: 'outline',
          size: 'large',
          width: 300,
          text: 'signin_with',
          shape: 'rectangular',
        }
      );
    }
  }, [handleGoogleResponse]);

  // Load Google Identity script once
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleAuth;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [initializeGoogleAuth]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="google-signin-button"></div>
      <p className="text-xs text-gray-500 text-center max-w-xs">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: string;
              size: string;
              width: number;
              text: string;
              shape: string;
            }
          ) => void;
        };
      };
    };
  }
}
