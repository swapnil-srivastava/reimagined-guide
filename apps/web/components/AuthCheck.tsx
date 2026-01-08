import Link from "next/link";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import { RootState } from "../lib/interfaces/interface";
import { useAnonymousAuth } from "../lib/use-anonymous-auth";
import { ReactElement } from "react";

// CSS
import styles from "../styles/Admin.module.css";

interface AuthCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Allow anonymous users to access the content */
  allowAnonymous?: boolean;
}

// Component's children only shown to logged-in users
// With allowAnonymous=true, also allows anonymous authenticated users OR unauthenticated users
// (for flows like cart/checkout where anonymous sign-in happens at payment time)
export default function AuthCheck({ children, fallback, allowAnonymous = false }: AuthCheckProps): ReactElement {
  // Check Redux store for user profile
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;
  
  // Also check the anonymous auth hook for anonymous users
  const { user: anonymousUser, isAnonymous } = useAnonymousAuth();
  
  // User has access if:
  // 1. They have a profile (permanent user)
  // 2. OR they have an anonymous session
  // 3. OR allowAnonymous is true (allows unauthenticated users to view, they'll sign in at checkout)
  const hasAccess = profile?.id || anonymousUser || allowAnonymous;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Link href="/enter" className="flex justify-center pt-5">
      <button className={styles.btnAdmin}>
        <FormattedMessage id="auth-check-fallback"
          description="Auth Check fallback message"
          defaultMessage="You must be signed in"
        />
      </button>
    </Link>
  );
}
