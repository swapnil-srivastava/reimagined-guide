import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";

// Components
import CartPage from "../../components/CartPage";
import { RootState } from "../../lib/interfaces/interface";
import { addressJSON } from "../../components/AddressForm";

// Supabase
import { supaClient } from "../../supa-client";

function Cart() {
  const selectStore = (state: RootState) => state.cart;
  const { cartItems } = useSelector(selectStore);

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const [addressState , setAddressState] = useState<addressJSON>();

  useEffect(() => {
    const checkAddress = async () => {
      if (profile) {
        const { data, error } = await supaClient
          .from('addresses')
          .select('*')
          .eq('user_id', profile.id);

        const [ address ] = data
        setAddressState(address);
      }
    };
    checkAddress();
  }, []);

  return (
    <>
      <div className="flex flex-col flex-wrap justify-center items-center">
        <div className="font-poppins lg:text-5xl text-3xl dark:text-blog-white text-blog-black p-10">
            <FormattedMessage
                id="cart-heading"
                description="Cart" // Description should be a string literal
                defaultMessage="Cart" // Message should be a string literal
            />
        </div>
        <CartPage cartItems={cartItems} profile={profile} addressState={addressState}/>
      </div>
    </>
  );
}

export default Cart;
