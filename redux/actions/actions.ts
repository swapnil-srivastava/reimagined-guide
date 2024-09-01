import { PRODUCT } from '../../database.types';
import { TAX_RATE } from '../../lib/library';
import { ProductWithQuantity } from '../../pages/checkout';
import * as types from './types'


interface UpdateSubtotalAction {
  type: typeof types.UPDATE_SUBTOTAL;
  subtotal: number;
}
  
interface UpdateTaxAction {
  type: typeof types.UPDATE_TAX;
  tax: number;
}
  
interface UpdateDeliveryCostAction {
  type: typeof types.UPDATE_DELIVERY_COST;
  deliveryCost: number;
}
  
interface UpdateTotalCostAction {
  type: typeof types.UPDATE_TOTAL_COST;
  total: number;
}

// UPDATE THE USER 
export const userUpdate = (payload) => ({ type: types.USER_UPDATE, user: payload });

// UPDATE THE USERNAME
export const usernameUpdate = (payload) => ({ type: types.USERNAME_UPDATE, username: payload });

// UPDATE THE SUPABASE USER
export const supabaseUser = (payload) => ({ type: types.SUPABASE_USER, supbaseUser: payload });

// Add the product to the cart
export const addToCartInsert = (payload: PRODUCT) => ({ type: types.ADD_TO_CART_INSERT, product: payload });

// Update the product to the cart
export const addToCartUpdate = (payload) => ({ type: types.ADD_TO_CART_INSERT, product: payload });

// Delete the product to the cart
export const addToCartDelete = (payload) => ({ type: types.ADD_TO_CART_DELETE, product: payload });

// Increment the Product quantity by one 
export const addToCartProductQuantityInc = (payload: PRODUCT) => ({ type: types.ADD_TO_CART_PRODUCT_QUANTITY_INC, product: payload });

// Decrement the Product quantity by 
export const addToCartProductQuantityDec = (payload: PRODUCT) => ({ type: types.ADD_TO_CART_PRODUCT_QUANTITY_DEC, product: payload });

// Address Create
export const addToCartAddressCreate = (payload) => ({ type: types.ADD_TO_CART_ADDRESS_CREATE, address: payload });

// Address Update
export const addToCartAddressUpdate = (payload) => ({ type: types.ADD_TO_CART_ADDRESS_UPDATE, address: payload });

// Address Delete
export const addToCartAddressDelete = (payload) => ({ type: types.ADD_TO_CART_ADDRESS_DELETE, address: payload });


export const fetchDeliveryOptions = () => ({
    type: types.FETCH_DELIVERY_OPTIONS,
});
  
export const updateDeliveryOption = (deliveryOption) => ({
    type: types.UPDATE_DELIVERY_OPTION,
    payload: deliveryOption,
});
  
export const createDeliveryOption = (deliveryOption) => ({
    type: types.CREATE_DELIVERY_OPTION,
    payload: deliveryOption,
});

export type CostActionTypes = UpdateSubtotalAction | UpdateTaxAction | UpdateDeliveryCostAction | UpdateTotalCostAction;

export const updateSubtotal = (cartItems: ProductWithQuantity[]): UpdateSubtotalAction => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return {
    type: types.UPDATE_SUBTOTAL,
    subtotal,
  };
};

export const updateTax = (subtotal: number, taxRate = TAX_RATE): UpdateTaxAction => {
  const tax = subtotal * taxRate;
  return {
    type: types.UPDATE_TAX,
    tax,
  };
};

export const updateDeliveryCost = (deliveryCost: number): UpdateDeliveryCostAction => {
  return {
    type: types.UPDATE_DELIVERY_COST,
    deliveryCost,
  };
};

export const updateTotalCost = (subtotal: number, tax: number, deliveryCost: number): UpdateTotalCostAction => {
  const total = subtotal + tax + deliveryCost;
  return {
    type: types.UPDATE_TOTAL_COST,
    total,
  };
};

export const fetchInviteEvents = (eventInvites) => {
  console.log("action creator #### fetchInviteEvents eventInvites", eventInvites);
  return {
    type: types.FETCH_EVENT_REQUEST,
    eventInvites: eventInvites
  };
};
