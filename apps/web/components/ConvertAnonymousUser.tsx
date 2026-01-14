import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faGithub, faApple } from '@fortawesome/free-brands-svg-icons';

// Hooks
import { useAnonymousAuth } from '../lib/use-anonymous-auth';

interface ConvertAnonymousUserProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * ConvertAnonymousUser Component
 * 
 * This component allows anonymous users to convert their temporary account
 * to a permanent account by linking an email or OAuth provider.
 * 
 * Use cases:
 * - After successful checkout as guest
 * - In user settings when user is logged in anonymously
 * - As a prompt to save their cart/order history
 */
export const ConvertAnonymousUser: React.FC<ConvertAnonymousUserProps> = ({
  onSuccess,
  onCancel,
  className = '',
}) => {
  const intl = useIntl();
  const { isAnonymous, convertToEmail, linkOAuth } = useAnonymousAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Don't render if user is not anonymous
  if (!isAnonymous) {
    return null;
  }

  const handleEmailConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error(intl.formatMessage({
        id: 'convert-anonymous-invalid-email',
        description: 'Please enter a valid email address',
        defaultMessage: 'Please enter a valid email address',
      }));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await convertToEmail(email);
      
      if (error) {
        throw error;
      }
      
      setEmailSent(true);
      
      toast.success(intl.formatMessage({
        id: 'convert-anonymous-email-sent',
        description: 'Verification email sent! Please check your inbox.',
        defaultMessage: 'Verification email sent! Please check your inbox to complete your account setup.',
      }), { duration: 5000 });
    } catch (err: any) {
      console.error('Email conversion error:', err);
      toast.error(err.message || intl.formatMessage({
        id: 'convert-anonymous-email-error',
        description: 'Failed to send verification email',
        defaultMessage: 'Failed to send verification email. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthConversion = async (provider: 'google' | 'github' | 'apple') => {
    setIsLoading(true);
    
    try {
      const { error } = await linkOAuth(provider);
      
      if (error) {
        throw error;
      }
      
      // The page will redirect to OAuth provider
      toast.success(intl.formatMessage({
        id: 'convert-anonymous-oauth-redirect',
        description: 'Redirecting to sign in...',
        defaultMessage: 'Redirecting to sign in...',
      }));
      
      onSuccess?.();
    } catch (err: any) {
      console.error('OAuth conversion error:', err);
      toast.error(err.message || intl.formatMessage({
        id: 'convert-anonymous-oauth-error',
        description: 'Failed to connect account',
        defaultMessage: 'Failed to connect account. Please try again.',
      }));
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-fun-blue-700 rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-hit-pink-100 dark:bg-hit-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-hit-pink-500" />
        </div>
        
        <h3 className="text-xl font-bold text-blog-black dark:text-blog-white mb-2">
          <FormattedMessage
            id="convert-anonymous-title"
            description="Save Your Account"
            defaultMessage="Save Your Account"
          />
        </h3>
        
        <p className="text-gray-600 dark:text-blog-white text-sm">
          <FormattedMessage
            id="convert-anonymous-description"
            description="Create a permanent account to access your order history and save your preferences."
            defaultMessage="Create a permanent account to access your order history and save your preferences."
          />
        </p>
      </div>

      {emailSent ? (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faCheck} className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  <FormattedMessage
                    id="convert-anonymous-email-sent-title"
                    description="Email sent title"
                    defaultMessage="Verification Email Sent!"
                  />
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                  <FormattedMessage
                    id="convert-anonymous-email-sent-instructions"
                    description="Instructions after email sent"
                    defaultMessage="We've sent a verification email to {email}. Please check your inbox and click the link to complete your account setup."
                    values={{ email: <strong>{email}</strong> }}
                  />
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mt-3">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>
                      <FormattedMessage
                        id="convert-anonymous-email-note-title"
                        description="Note about email content"
                        defaultMessage="Note:"
                      />
                    </strong>{' '}
                    <FormattedMessage
                      id="convert-anonymous-email-note-content"
                      description="Explanation of email content"
                      defaultMessage='The email subject will say "Confirm your email" or "Change Email". This is normal - just click the link to verify your account.'
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              setEmailSent(false);
              setShowEmailForm(false);
              setEmail('');
            }}
            className="w-full py-3 px-4 border border-gray-300 dark:border-fun-blue-500 rounded-lg text-blog-black dark:text-blog-white hover:bg-gray-50 dark:hover:bg-fun-blue-600 transition-colors"
          >
            <FormattedMessage
              id="convert-anonymous-back-to-options"
              description="Back to options"
              defaultMessage="Back to Options"
            />
          </button>
        </div>
      ) : showEmailForm ? (
        <form onSubmit={handleEmailConversion} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              <FormattedMessage
                id="convert-anonymous-email-label"
                description="Email"
                defaultMessage="Email"
              />
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={intl.formatMessage({
                  id: 'convert-anonymous-email-placeholder',
                  description: 'Enter your email',
                  defaultMessage: 'Enter your email address',
                })}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-fun-blue-500 rounded-lg bg-white dark:bg-fun-blue-600 text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-hit-pink-500 disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-fun-blue-500 rounded-lg text-blog-black dark:text-blog-white hover:bg-gray-50 dark:hover:bg-fun-blue-600 transition-colors disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              <FormattedMessage
                id="convert-anonymous-back"
                description="Back"
                defaultMessage="Back"
              />
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-hit-pink-500 text-blog-black rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
              {isLoading ? (
                <FormattedMessage
                  id="convert-anonymous-sending"
                  description="Sending..."
                  defaultMessage="Sending..."
                />
              ) : (
                <FormattedMessage
                  id="convert-anonymous-send-link"
                  description="Send Link"
                  defaultMessage="Send Link"
                />
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {/* Email Option */}
          <button
            onClick={() => setShowEmailForm(true)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-fun-blue-500 rounded-lg text-blog-black dark:text-blog-white hover:bg-gray-50 dark:hover:bg-fun-blue-600 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
            <FormattedMessage
              id="convert-anonymous-email-button"
              description="Continue with Email"
              defaultMessage="Continue with Email"
            />
          </button>

          {/* OAuth Options */}
          <button
            onClick={() => handleOAuthConversion('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faGoogle} className="w-5 h-5 text-red-500" />
            <FormattedMessage
              id="convert-anonymous-google-button"
              description="Continue with Google"
              defaultMessage="Continue with Google"
            />
          </button>

          <button
            onClick={() => handleOAuthConversion('github')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-900 rounded-lg text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
            <FormattedMessage
              id="convert-anonymous-github-button"
              description="Continue with GitHub"
              defaultMessage="Continue with GitHub"
            />
          </button>

          {/* Skip/Cancel Option */}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="w-full py-2 text-sm text-gray-500 dark:text-blog-white hover:text-gray-700 dark:hover:text-blog-white transition-colors"
            >
              <FormattedMessage
                id="convert-anonymous-skip"
                description="Skip for now"
                defaultMessage="Skip for now"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ConvertAnonymousUser;
