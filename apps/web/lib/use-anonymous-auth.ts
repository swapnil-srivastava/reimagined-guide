import { useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supaClient } from '../supa-client';

/**
 * Anonymous authentication hook for Supabase
 * 
 * This hook provides functionality to:
 * 1. Sign in anonymously (creates a temporary authenticated session)
 * 2. Check if current user is anonymous
 * 3. Convert anonymous user to permanent user
 * 
 * Anonymous users:
 * - Use the 'authenticated' role (same as permanent users)
 * - Have an 'is_anonymous' claim in their JWT set to true
 * - Can be converted to permanent users by linking an email/OAuth identity
 * 
 * @see https://supabase.com/docs/guides/auth/auth-anonymous
 */

export interface AnonymousAuthState {
  user: User | null;
  session: Session | null;
  isAnonymous: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface UseAnonymousAuthReturn extends AnonymousAuthState {
  signInAnonymously: (captchaToken?: string) => Promise<{ user: User | null; error: Error | null }>;
  convertToEmail: (email: string) => Promise<{ error: Error | null }>;
  linkOAuth: (provider: 'google' | 'github' | 'apple') => Promise<{ error: Error | null }>;
}

/**
 * Check if a user is anonymous based on their app_metadata
 */
export function isUserAnonymous(user: User | null): boolean {
  if (!user) return false;
  // The is_anonymous flag is stored in user's app_metadata
  return user.is_anonymous === true;
}

/**
 * Hook for managing anonymous authentication
 */
export function useAnonymousAuth(): UseAnonymousAuthReturn {
  const [state, setState] = useState<AnonymousAuthState>({
    user: null,
    session: null,
    isAnonymous: false,
    isLoading: true,
    error: null,
  });

  // Initialize and listen for auth changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supaClient.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setState({
            user: session?.user || null,
            session,
            isAnonymous: isUserAnonymous(session?.user || null),
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err : new Error('Failed to initialize auth'),
          }));
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supaClient.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setState({
            user: session?.user || null,
            session,
            isAnonymous: isUserAnonymous(session?.user || null),
            isLoading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in anonymously
   * Creates a new anonymous user session that can later be converted to a permanent account
   * @param captchaToken - Optional hCaptcha token for bot protection
   */
  const signInAnonymously = useCallback(async (captchaToken?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supaClient.auth.signInAnonymously({
        options: captchaToken ? { captchaToken } : undefined
      });
      
      if (error) throw error;

      return { user: data.user, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign in anonymously');
      setState(prev => ({ ...prev, error, isLoading: false }));
      return { user: null, error };
    }
  }, []);

  /**
   * Convert anonymous user to permanent user by linking email
   * The user will receive a verification email
   */
  const convertToEmail = useCallback(async (email: string) => {
    try {
      if (!state.isAnonymous) {
        throw new Error('User is not anonymous');
      }

      // Get the current origin for redirect URL
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/enter`
        : undefined;

      const { error } = await supaClient.auth.updateUser(
        { email },
        {
          emailRedirectTo: redirectUrl,
        }
      );
      
      if (error) throw error;

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to link email');
      return { error };
    }
  }, [state.isAnonymous]);

  /**
   * Convert anonymous user to permanent user by linking OAuth provider
   * This will redirect to the OAuth provider's login page
   */
  const linkOAuth = useCallback(async (provider: 'google' | 'github' | 'apple') => {
    try {
      if (!state.isAnonymous) {
        throw new Error('User is not anonymous');
      }

      // Get the current origin for redirect URL
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/enter`
        : undefined;

      const { error } = await supaClient.auth.linkIdentity({ 
        provider,
        options: {
          redirectTo: redirectUrl,
        }
      });
      
      if (error) throw error;

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to link OAuth provider');
      return { error };
    }
  }, [state.isAnonymous]);

  return {
    ...state,
    signInAnonymously,
    convertToEmail,
    linkOAuth,
  };
}

/**
 * Utility function to sign in anonymously (for use outside of React components)
 * @param captchaToken - Optional hCaptcha token for bot protection
 */
export async function signInAnonymously(captchaToken?: string) {
  return supaClient.auth.signInAnonymously({
    options: captchaToken ? { captchaToken } : undefined
  });
}

/**
 * Utility function to convert anonymous user to permanent user with email
 */
export async function convertAnonymousToEmail(email: string) {
  return supaClient.auth.updateUser({ email });
}

/**
 * Utility function to link OAuth identity to anonymous user
 */
export async function linkOAuthIdentity(provider: 'google' | 'github' | 'apple') {
  return supaClient.auth.linkIdentity({ provider });
}

export default useAnonymousAuth;
