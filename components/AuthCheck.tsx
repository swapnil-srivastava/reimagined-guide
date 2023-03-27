import Link from "next/link";
import { useSelector } from "react-redux";
import { SupashipUserInfo } from "../lib/hooks";

interface RootState {
  counter: Object;
  users: UserState;
}

interface UserState {
  user: Object;
  username: any;
  userInfo: SupashipUserInfo;
}

// Component's children only shown to logged-in users
export default function AuthCheck(props) {
  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  return profile?.id
    ? props.children
    : props.fallback || <Link href="/enter">You must be signed in</Link>;
}
