import { SupashipUserInfo } from "../../lib/hooks";

export interface RootState {
  counter: Object;
  users: UserState;
  cart: CartState
}

export interface UserState {
  user: User;
  username: any;
  userInfo: SupashipUserInfo;
}

export interface CartState {
  cartItems: []
}

interface User {
  uid: String;
  photoURL?: String;
  displayName?: String;
}

export type { SupashipUserInfo };
