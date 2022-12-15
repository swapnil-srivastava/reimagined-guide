import Link from 'next/link';
import { useSelector } from 'react-redux';

interface RootState {
  counter: Object
  users: UserState,
}

interface UserState {
  user: Object,
  username: any
}

// Component's children only shown to logged-in users
export default function AuthCheck(props) {
  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users; 
  const { username } = useSelector(selectUser);

  return username ? props.children : props.fallback || <Link href="/enter">You must be signed in</Link>;
}