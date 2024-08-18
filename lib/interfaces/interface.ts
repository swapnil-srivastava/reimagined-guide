import { ADDRESS } from "../../database.types";
import { SupashipUserInfo } from "../../lib/hooks";

export interface RootState {
  users: UserState;
  cart: CartState;
  address: AddressState;
  deliveryType: DeliveryTypeState;
  subtotal: SubtotalState;
}

export interface UserState {
  user: User;
  username: any;
  userInfo: SupashipUserInfo;
}

export interface CartState {
  cartItems: []
}

export interface AddressState {
  customerAddress: ADDRESS | null;
}

export interface DeliveryTypeState {
  deliveryType: {}
}

export interface SubtotalState {
  subtotal: {}
}

interface User {
  uid: String;
  photoURL?: String;
  displayName?: String;
}

export type { SupashipUserInfo };
