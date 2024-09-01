import { ProductWithQuantity } from "../../components/CartPage";
import { ADDRESS } from "../../database.types";
import { SupashipUserInfo } from "../../lib/hooks";
import { InviteEventsState } from "../../redux/reducer/inviteEventsReducer";
import { SubTotalStoreState } from "../../redux/reducer/subTotalReducer";

export interface RootState {
  users: UserState;
  cart: CartState;
  address: AddressState;
  deliveryType: DeliveryTypeState;
  subtotal: SubTotalStoreState;
  inviteEventsReducer: InviteEventsState
}

export interface UserState {
  user: User;
  username: any;
  userInfo: SupashipUserInfo;
}

export interface CartState {
  cartItems: ProductWithQuantity[];
}

export interface AddressState {
  customerAddress: ADDRESS | null;
}

interface DeliveryOptions {
  id: string;
  name: string;
  description: string;
  deliveryPrice: number;
}

export interface DeliveryTypeState {
  deliveryType: {
    deliveryOption: DeliveryOptions
  }
  deliveryOptions: []
}

interface User {
  uid: String;
  photoURL?: String;
  displayName?: String;
}

export type { SupashipUserInfo };
