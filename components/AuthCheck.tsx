import Link from 'next/link';
import { useSelector } from 'react-redux';

// Component's children only shown to logged-in users
export default function AuthCheck(props) {
  const { username } = useSelector(state => state.users);

  return username ? props.children : props.fallback || <Link href="/enter">You must be signed in</Link>;
}