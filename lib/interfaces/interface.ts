import { SupashipUserInfo } from "../../lib/hooks";

export interface RootState {
  counter: Object;
  users: UserState;
}

export interface UserState {
  user: User;
  username: any;
  userInfo: SupashipUserInfo;
}

interface User {
  uid: String;
  photoURL?: String;
  displayName?: String;
}

export type { SupashipUserInfo };
