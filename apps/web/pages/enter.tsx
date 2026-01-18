import React, { useCallback, useEffect, useState, useRef } from "react";
import { NextPage } from "next";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { supaClient } from "../supa-client";
import { RootState } from "../lib/interfaces/interface";
import { userLogout } from "../redux/actions/actions";
import debounce from "lodash.debounce";
import Image from "next/image";
import { toast } from "react-hot-toast";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import HCaptchaWidget from "../components/HCaptchaWidget";

// e.g. localhost:3000/enter
const Enter: NextPage = () => {
  const selectUser = (state: RootState) => state.users;
  const userData = useSelector(selectUser);
  const userInfo = userData?.userInfo;
  const { profile, session } = userInfo || { profile: null, session: null };

  // 1. user signed out <AuthCard />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, has username <SignOutCard />
  return (
    <main className="min-h-screen bg-blog-white dark:bg-fun-blue-500 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {profile?.id ? (
          !profile?.username ? (
            <UsernameForm />
          ) : (
            <SignOutCard />
          )
        ) : (
          <AuthCard />
        )}
      </div>
    </main>
  );
}

// Modern Authentication Card with email/password and OAuth
function AuthCard() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const intl = useIntl();

  const validateForm = () => {
    if (!email) return false;
    if (useMagicLink) return true; // Magic link only needs email
    if (!password) return false;
    if (isSignUp && password !== confirmPassword) return false;
    if (password.length < 6) return false;
    return true;
  };

  const handleMagicLinkAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Require captcha verification
    if (!captchaToken) {
      toast.error(intl.formatMessage({
        id: "auth-captcha-required",
        description: "Captcha verification required",
        defaultMessage: "Please complete the captcha verification"
      }));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supaClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/enter`,
          captchaToken
        }
      });

      if (error) throw error;

      toast.success(intl.formatMessage({
        id: "auth-magic-link-sent",
        description: "Magic link sent",
        defaultMessage: "Check your email! We've sent you a magic link to sign in."
      }), { duration: 5000 });

      // Reset captcha after sending
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } catch (error: any) {
      console.error('Magic link error:', error);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
      toast.error(error?.message || intl.formatMessage({
        id: "auth-magic-link-error",
        description: "Magic link error",
        defaultMessage: "Failed to send magic link. Please try again."
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (useMagicLink) {
      return handleMagicLinkAuth(e);
    }
    if (!validateForm()) return;
    
    // Require captcha verification
    if (!captchaToken) {
      toast.error(intl.formatMessage({
        id: "auth-captcha-required",
        description: "Captcha verification required",
        defaultMessage: "Please complete the captcha verification"
      }));
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supaClient.auth.signUp({
          email,
          password,
          options: { captchaToken }
        });
        
        if (error) throw error;
        
        if (data.user && !data.session) {
          toast.success(intl.formatMessage({
            id: "auth-check-email-verification",
            description: "Check email for verification",
            defaultMessage: "Please check your email for verification link!"
          }));
        } else if (data.session) {
          toast.success(intl.formatMessage({
            id: "auth-signup-success",
            description: "Account created successfully",
            defaultMessage: "Account created successfully!"
          }));
        }
      } else {
        const { data, error } = await supaClient.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken }
        });
        
        if (error) throw error;
        
        toast.success(intl.formatMessage({
          id: "auth-sign-in-success",
          description: "Sign in successful",
          defaultMessage: "Welcome back!"
        }));
      }
      
      // Reset captcha after successful auth
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } catch (error: any) {
      console.error('Authentication error:', error);
      // Reset captcha on error too so user can retry
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
      const errorMessage = error?.message || intl.formatMessage({
        id: "auth-error-generic",
        description: "Authentication error",
        defaultMessage: "Something went wrong. Please try again."
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supaClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/enter`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google authentication error:', error);
      const errorMessage = error?.message || intl.formatMessage({
        id: "auth-google-error",
        description: "Google sign in error",
        defaultMessage: "Google sign in failed. Please try again."
      });
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white dark:bg-fun-blue-800 shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-fun-blue-600">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-fun-blue-500 rounded-full flex items-center justify-center text-blog-black dark:text-blog-white">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-black mb-2">
          <FormattedMessage
            id={isSignUp ? "auth-welcome-signup" : "auth-welcome-signin"}
            description={isSignUp ? "Welcome signup" : "Welcome signin"}
            defaultMessage={isSignUp ? "Create your account" : "Welcome back"}
          />
        </h1>
        <p className="text-gray-600 dark:text-blog-white">
          <FormattedMessage
            id={isSignUp ? "auth-subtitle-signup" : "auth-subtitle-signin"}
            description={isSignUp ? "Signup subtitle" : "Signin subtitle"}
            defaultMessage={isSignUp ? "Join our community today" : "Sign in to your account"}
          />
        </p>
      </div>

      {/* Google Sign In Button */}
      <button
        onClick={handleGoogleAuth}
        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 
                   border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-6
                   hover:bg-gray-50 dark:hover:bg-gray-600 
                   transition-all duration-200 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2
                   text-gray-700 dark:text-blog-white font-medium"
      >
        {/* Google SVG Icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <FormattedMessage
          id="auth-continue-google"
          description="Continue with Google"
          defaultMessage="Continue with Google"
        />
      </button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 card--white dark:bg-fun-blue-800 text-gray-500 dark:text-blog-white">
            <FormattedMessage
              id="auth-or-divider"
              description="Or divider"
              defaultMessage="or"
            />
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {/* Toggle between password and magic link */}
        {!isSignUp && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-100 dark:bg-gray-700">
              <button
                type="button"
                onClick={() => setUseMagicLink(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  !useMagicLink
                    ? 'bg-white dark:bg-fun-blue-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-blog-white hover:text-gray-900 dark:hover:text-blog-white'
                }`}
              >
                <FormattedMessage
                  id="auth-use-password"
                  description="Use password"
                  defaultMessage="Password"
                />
              </button>
              <button
                type="button"
                onClick={() => setUseMagicLink(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  useMagicLink
                    ? 'bg-white dark:bg-fun-blue-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-blog-white hover:text-gray-900 dark:hover:text-blog-white'
                }`}
              >
                <FormattedMessage
                  id="auth-use-magic-link"
                  description="Use magic link"
                  defaultMessage="Magic Link"
                />
              </button>
            </div>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
            <FormattedMessage
              id="auth-email-label"
              description="Email address"
              defaultMessage="Email address"
            />
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700
                       text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:border-transparent
                       transition-all duration-200"
            placeholder={intl.formatMessage({
              id: "auth-email-placeholder",
              description: "Email placeholder",
              defaultMessage: "Enter your email"
            })}
            required
          />
        </div>

        {/* Password Fields - only show if not using magic link */}
        {!useMagicLink && (
          <>
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                <FormattedMessage
                  id="auth-password-label"
                  description="Password"
                  defaultMessage="Password"
                />
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 
                             rounded-lg bg-white dark:bg-gray-700
                             text-gray-900 dark:text-white
                             placeholder-gray-500 dark:placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:border-transparent
                             transition-all duration-200"
                  placeholder={intl.formatMessage({
                    id: "auth-password-placeholder",
                    description: "Password placeholder",
                    defaultMessage: "Enter your password"
                  })}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Confirm Password Field (Sign Up Only) */}
        {isSignUp && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
              <FormattedMessage
                id="auth-confirm-password-label"
                description="Confirm password"
                defaultMessage="Confirm password"
              />
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700
                         text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:border-transparent
                         transition-all duration-200"
              placeholder={intl.formatMessage({
                id: "auth-confirm-password-placeholder",
                description: "Confirm password placeholder",
                defaultMessage: "Confirm your password"
              })}
              required
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                <FormattedMessage
                  id="auth-password-mismatch"
                  description="Passwords don't match"
                  defaultMessage="Passwords don't match"
                />
              </p>
            )}
          </div>
        )}
          </>
        )}

        {/* hCaptcha Widget */}
        <div className="flex justify-center py-2">
          <HCaptchaWidget
            ref={captchaRef}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            size="compact"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!validateForm() || loading || !captchaToken}
          className="w-full bg-fun-blue-500 hover:bg-fun-blue-600 
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     text-white font-medium py-3 px-4 rounded-lg
                     transition-all duration-200 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2
                     flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <FormattedMessage
            id={useMagicLink ? "auth-send-magic-link" : (isSignUp ? "auth-signup-button" : "auth-signin-button")}
            description={useMagicLink ? "Send magic link" : (isSignUp ? "Sign up button" : "Sign in button")}
            defaultMessage={useMagicLink ? "Send Magic Link" : (isSignUp ? "Create account" : "Sign in")}
          />
        </button>
      </form>

      {/* Toggle Sign In/Sign Up */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-blog-white">
          <FormattedMessage
            id={isSignUp ? "auth-have-account" : "auth-no-account"}
            description={isSignUp ? "Already have account" : "Don't have account"}
            defaultMessage={isSignUp ? "Already have an account?" : "Don't have an account?"}
          />
          {" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-fun-blue-500 hover:text-fun-blue-600 font-medium transition-colors duration-200"
          >
            <FormattedMessage
              id={isSignUp ? "auth-signin-link" : "auth-signup-link"}
              description={isSignUp ? "Sign in link" : "Sign up link"}
              defaultMessage={isSignUp ? "Sign in" : "Sign up"}
            />
          </button>
        </p>
      </div>
    </div>
  );
}

// Avatar component with first letter fallback
function UserAvatar({ user, size = "large" }: { 
  user: { email?: string; username?: string; avatar_url?: string } | null | undefined; 
  size?: "small" | "medium" | "large" 
}) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    small: "w-8 h-8 text-sm",
    medium: "w-12 h-12 text-lg",
    large: "w-20 h-20 text-2xl"
  };

  // Safely get the first letter from username, email, or fallback to 'U'
  const getInitial = () => {
    if (!user) return 'U';
    if (user.username && user.username.length > 0) return user.username.charAt(0).toUpperCase();
    if (user.email && user.email.length > 0) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  // Generate a consistent background color based on the initial
  const getAvatarColor = () => {
    const initial = getInitial();
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    return colors[initial.charCodeAt(0) % colors.length];
  };

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.avatar_url]);

  // Show avatar image if available, user exists, and no error occurred
  if (user?.avatar_url && !imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 relative`}>
        {/* Use regular img tag instead of Next.js Image to avoid static import issues */}
        <img
          src={user.avatar_url}
          alt={`${user.username || user.email || 'User'} avatar`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback to initial-based avatar
  return (
    <div className={`${sizeClasses[size]} ${getAvatarColor()} rounded-full flex items-center justify-center text-white font-bold`}>
      {getInitial()}
    </div>
  );
}

// Sign out card
function SignOutCard() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const selectUser = (state: RootState) => state.users;
  const userData = useSelector(selectUser);
  const userInfo = userData?.userInfo;
  const { profile, session } = userInfo || { profile: null, session: null };

  // Get user email from session or profile
  const userEmail = session?.user?.email || profile?.email || "";
  const username = profile?.username || "";

  async function signoutSupa() {
    try {
      // First sign out from Supabase to handle session properly
      const { error } = await supaClient.auth.signOut();
      if (error) {
        console.error('Supabase signout error:', error);
        // If it's just a session error, continue with cleanup
        if (!error.message?.includes('Session from session_id claim in JWT does not exist')) {
          throw error;
        }
      }
      
      // Then clear the Redux state
      dispatch(userLogout());
      
      // Clear any local storage items that might persist
      localStorage.removeItem('supabase.auth.token');
      
      toast.success(intl.formatMessage({
        id: "auth-signout-success",
        description: "Sign out successful",
        defaultMessage: "You've been signed out successfully!"
      }));
      
      // Redirect to home page after successful logout
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      // Even if there's an error, try to clear the state
      dispatch(userLogout());
      localStorage.removeItem('supabase.auth.token');
      
      toast.error(error.message || intl.formatMessage({
        id: "auth-signout-error",
        description: "Sign out error",
        defaultMessage: "Failed to sign out. Please try again."
      }));
      
      // Still redirect after error to ensure user is logged out
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }

  return (
    <div className="bg-white dark:bg-fun-blue-800 shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-fun-blue-600 text-center">
      {/* Profile Avatar */}
      <div className="flex justify-center mb-6">
        <UserAvatar 
          user={{ 
            email: userEmail, 
            username: username,
            avatar_url: profile?.avatar_url 
          }} 
          size="large" 
        />
      </div>

      {/* Welcome Message */}
      <h1 className="text-2xl font-bold text-blog-black dark:text-white mb-2">
        <FormattedMessage
          id="auth-welcome-back"
          description="Welcome back message"
          defaultMessage="Welcome back, {username}!"
          values={{ username: username || userEmail.split('@')[0] || "User" }}
        />
      </h1>
      
      <p className="text-gray-600 dark:text-blog-white mb-8">
        <FormattedMessage
          id="auth-signed-in-message"
          description="Signed in message"
          defaultMessage="You are successfully signed in"
        />
      </p>

      {/* Actions */}
      <div className="space-y-4">
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-fun-blue-500 hover:bg-fun-blue-600 
                     text-white font-medium py-3 px-4 rounded-lg
                     transition-all duration-200 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2"
        >
          <FormattedMessage
            id="auth-go-to-dashboard"
            description="Go to dashboard"
            defaultMessage="Go to Dashboard"
          />
        </button>

        <button
          onClick={signoutSupa}
          className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                     text-gray-700 dark:text-blog-white font-medium py-3 px-4 rounded-lg
                     transition-all duration-200 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          <FormattedMessage
            id="auth-sign-out"
            description="Sign Out"
            defaultMessage="Sign Out"
          />
        </button>
      </div>
    </div>
  );
}

// Username form
function UsernameForm() {
  const [formValue, setFormValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const intl = useIntl();

  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const userData = useSelector(selectUser);
  const userInfo = userData?.userInfo;
  const { profile, session } = userInfo || { profile: null, session: null };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !formValue) return;

    setLoading(true);
    try {
      const { data, error } = await supaClient
        .from("profiles")
        .update({ username: formValue })
        .eq("id", profile?.id)
        .select();
      
      if (error) throw error;
      
      toast.success(intl.formatMessage({
        id: "auth-username-updated",
        description: "Username updated successfully",
        defaultMessage: "Username updated successfully!"
      }));

      // Reload the page to refresh the user state and show the SignOutCard
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Username update error:', error);
      toast.error(error.message || intl.formatMessage({
        id: "auth-username-update-error",
        description: "Username update error",
        defaultMessage: "Failed to update username. Please try again."
      }));
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Force form value typed in form to match correct format
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    // Only set form value if length is < 3 OR it passes regex
    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  // Hit the database for username match after each debounced change
  // useCallback is required for debounce to work
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        let { data: profiles, error } = await supaClient
          .from("profiles")
          .select("username")
          .like("username", username); // "%CaseSensitive%"
        setIsValid(profiles?.length === 0);
        setLoading(false);
      }
    }, 500),
    []
  );

  // Get user email for welcome message
  const userEmail = session?.user?.email || "";
  const welcomeName = userEmail ? userEmail.split('@')[0] : "there";

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await supaClient.auth.signOut();
      toast.success(intl.formatMessage({
        id: "auth-signout-success",
        description: "Sign out successful",
        defaultMessage: "Signed out successfully!"
      }));
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(intl.formatMessage({
        id: "auth-signout-error",
        description: "Sign out error",
        defaultMessage: "Failed to sign out"
      }));
    }
  };

  return (
    <div className="bg-white dark:bg-fun-blue-800 shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-fun-blue-600">
      {/* Sign out button in top right */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-600 dark:text-blog-white hover:text-fun-blue-500 dark:hover:text-fun-blue-300 transition-colors underline"
        >
          <FormattedMessage
            id="auth-signout-button"
            description="Sign out button"
            defaultMessage="Sign out"
          />
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        {/* Welcome checkmark icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        {/* Welcome message */}
        <h1 className="text-3xl font-bold text-black mb-2">
          <FormattedMessage
            id="auth-welcome-verified"
            description="Welcome after email verification"
            defaultMessage="Welcome {name}!"
            values={{ name: welcomeName }}
          />
        </h1>
        
        <p className="text-black mb-4">
          <FormattedMessage
            id="auth-email-verified-success"
            description="Email verified successfully"
            defaultMessage="Your email has been verified successfully!"
          />
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-black mb-2">
            <FormattedMessage
              id="auth-choose-username-title"
              description="Choose username title"
              defaultMessage="Choose your username"
            />
          </h2>
          <p className="text-sm text-gray-600 dark:text-blog-white mb-2">
            <FormattedMessage
              id="auth-choose-username-subtitle"
              description="Choose username subtitle"
              defaultMessage="This will be your unique identifier and profile URL"
            />
          </p>
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
            <p className="text-xs text-gray-600 dark:text-blog-white">
              <FormattedMessage
                id="auth-no-password-needed"
                description="No password needed explanation"
                defaultMessage="ℹ️ No password required! You'll sign in using magic links sent to your email ({email})."
                values={{ email: userEmail }}
              />
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
            <span className="after:content-['*'] after:ml-0.5 after:text-red-500">
              <FormattedMessage
                id="auth-username-label"
                description="Username"
                defaultMessage="Username"
              />
            </span>
          </label>
          
          {/* Username input with preview */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <span className="text-gray-400 dark:text-blog-white text-xs font-mono">
                {typeof window !== 'undefined' ? new URL(window.location.origin).hostname : ''}/
              </span>
            </div>
            <input
              id="username"
              name="username"
              value={formValue}
              onChange={onChange}
              style={{ paddingLeft: typeof window !== 'undefined' ? `${new URL(window.location.origin).hostname.length * 7 + 30}px` : '120px' }}
              className="w-full pr-3 py-3 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700
                         text-gray-900 dark:text-white font-mono
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent
                         transition-all duration-200 text-sm"
              placeholder={intl.formatMessage({
                id: "auth-username-placeholder",
                description: "Username placeholder",
                defaultMessage: "your-username"
              })}
              autoComplete="username"
              required
            />
          </div>
          
          {/* Username validation message */}
          <div className="mt-3 min-h-[2rem]">
            <UsernameMessage
              username={formValue}
              isValid={isValid}
              loading={loading}
            />
          </div>
          
          {/* Requirements */}
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-blog-white">
              <FormattedMessage
                id="auth-username-requirements"
                description="Username requirements"
                defaultMessage="3-15 characters, letters, numbers, dots and underscores only"
              />
            </p>
          </div>
        </div>

        {/* Preview box */}
        {formValue && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-blog-white mb-1">
              <FormattedMessage
                id="auth-profile-preview"
                description="Profile preview"
                defaultMessage="Your profile will be available at:"
              />
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-fun-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {formValue.charAt(0).toUpperCase()}
              </div>
              <span className="font-mono text-sm text-fun-blue-500">
                {typeof window !== 'undefined' ? window.location.origin : ''}/{formValue}
              </span>
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full bg-fun-blue-500 hover:bg-fun-blue-600 
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     text-white font-medium py-3 px-4 rounded-lg
                     transition-all duration-200 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2
                     flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <FormattedMessage
            id="auth-continue-to-profile"
            description="Continue to profile button"
            defaultMessage="Continue to Profile"
          />
        </button>
      </form>
      
      {/* Help text */}
      <div className="mt-6 space-y-4">
        {/* How to sign in after username is set */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                <FormattedMessage
                  id="auth-how-to-signin-title"
                  description="How to sign in title"
                  defaultMessage="How to Sign In Next Time"
                />
              </h4>
              <ol className="text-xs text-gray-700 dark:text-blog-white space-y-2 list-decimal list-inside">
                <li>
                  <FormattedMessage
                    id="auth-signin-step-1"
                    description="Sign in step 1"
                    defaultMessage="Come back to this page and enter your email: {email}"
                    values={{ email: <strong className="text-fun-blue-600 dark:text-fun-blue-400">{userEmail}</strong> }}
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="auth-signin-step-2"
                    description="Sign in step 2"
                    defaultMessage="Click 'Sign in with magic link' button"
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="auth-signin-step-3"
                    description="Sign in step 3"
                    defaultMessage="Check your email and click the sign-in link - you're in!"
                  />
                </li>
              </ol>
              <p className="mt-3 text-xs text-gray-600 dark:text-blog-white italic">
                <FormattedMessage
                  id="auth-signin-note"
                  description="Sign in note"
                  defaultMessage="💡 Tip: You can also sign in with Google if you prefer!"
                />
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-blog-white text-center">
          <FormattedMessage
            id="auth-username-help"
            description="Username help text"
            defaultMessage="You can change this later in your profile settings"
          />
        </p>
      </div>
    </div>
  );
}

function UsernameMessage({ username, isValid, loading }: { 
  username: string; 
  isValid: boolean; 
  loading: boolean; 
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm">
          <FormattedMessage
            id="auth-checking-username"
            description="Checking..."
            defaultMessage="Checking..."
          />
        </span>
      </div>
    );
  } else if (isValid) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm">
          <FormattedMessage
            id="auth-username-available"
            description="Username is available"
            defaultMessage="{username} is available!"
            values={{ username }}
          />
        </span>
      </div>
    );
  } else if (username && !isValid) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="text-sm">
          <FormattedMessage
            id="auth-username-taken"
            description="That username is taken!"
            defaultMessage="That username is taken!"
          />
        </span>
      </div>
    );
  } else {
    return <div className="text-sm text-gray-500">
      <FormattedMessage
        id="auth-username-requirements"
        description="Username requirements"
        defaultMessage="3-15 characters, letters, numbers, dots and underscores only"
      />
    </div>;
  }
}

export default Enter;
