import React, { forwardRef, useCallback } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { FormattedMessage } from 'react-intl';
import { useTheme } from 'next-themes';

// Type assertion to fix HCaptcha component type compatibility with React 18
const HCaptchaComponent = HCaptcha as unknown as React.ComponentType<{
  sitekey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact' | 'invisible';
  ref?: React.Ref<HCaptcha>;
}>;

interface HCaptchaWidgetProps {
  /** Callback when captcha is successfully verified */
  onVerify: (token: string) => void;
  /** Callback when captcha expires */
  onExpire?: () => void;
  /** Callback when captcha encounters an error */
  onError?: (error: string) => void;
  /** Optional className for the container */
  className?: string;
  /** Size of the captcha widget */
  size?: 'normal' | 'compact' | 'invisible';
}

/**
 * HCaptcha widget component with dark mode support and i18n
 * 
 * Usage:
 * ```tsx
 * const [captchaToken, setCaptchaToken] = useState<string | null>(null);
 * const captchaRef = useRef<HCaptcha>(null);
 * 
 * <HCaptchaWidget
 *   ref={captchaRef}
 *   onVerify={(token) => setCaptchaToken(token)}
 *   onExpire={() => setCaptchaToken(null)}
 * />
 * ```
 */
const HCaptchaWidget = forwardRef<HCaptcha, HCaptchaWidgetProps>(
  ({ onVerify, onExpire, onError, className = '', size = 'normal' }, ref) => {
    const { resolvedTheme } = useTheme();
    const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

    const handleVerify = useCallback((token: string) => {
      onVerify(token);
    }, [onVerify]);

    const handleExpire = useCallback(() => {
      onExpire?.();
    }, [onExpire]);

    const handleError = useCallback((error: string) => {
      console.error('hCaptcha error:', error);
      onError?.(error);
    }, [onError]);

    if (!siteKey) {
      console.warn('NEXT_PUBLIC_HCAPTCHA_SITE_KEY is not set');
      return (
        <div className={`text-yellow-600 dark:text-yellow-400 text-sm ${className}`}>
          <FormattedMessage
            id="hcaptcha-missing-key"
            description="Warning when hCaptcha site key is missing"
            defaultMessage="Captcha configuration missing"
          />
        </div>
      );
    }

    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          <FormattedMessage
            id="hcaptcha-verification-label"
            description="Label asking user to complete captcha verification"
            defaultMessage="Please verify you're human"
          />
        </div>
        <HCaptchaComponent
          ref={ref}
          sitekey={siteKey}
          onVerify={handleVerify}
          onExpire={handleExpire}
          onError={handleError}
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          size={size}
        />
      </div>
    );
  }
);

HCaptchaWidget.displayName = 'HCaptchaWidget';

export default HCaptchaWidget;
