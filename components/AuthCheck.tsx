import Link from "next/link";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import { RootState } from "../lib/interfaces/interface";

// Component's children only shown to logged-in users
export default function AuthCheck(props) {
  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  return profile?.id
    ? props.children
    : props.fallback || <Link href="/enter"><FormattedMessage id="auth-check-fallback"
                                description="Auth Check fallback message" // Description should be a string literal
                                defaultMessage="You must be signed in" // Message should be a string literal
                                />
      </Link>;
}
