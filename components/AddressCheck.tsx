'use client';

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { RootState } from "../lib/interfaces/interface";

// Logged in 
import AuthCheck from "./AuthCheck";

// address form
import AddressForm, { addressJSON } from "./AddressForm";

// Supabase
import { supaClient } from "../supa-client";

// Component's children only shown to logged-in users
export default function AddressCheck(props) {
  // TS infers type: (state: RootState) => boolean
  // const selectUser = (state: RootState) => state.users;
  // const { userInfo } = useSelector(selectUser);
  // const { profile, session } = userInfo;

  // const [addressState , setAddressState] = useState<addressJSON>();

  // useEffect(() => {
  //   const checkAddress = async () => {
  //     if (profile) {
  //       const { data, error } = await supaClient
  //         .from('addresses')
  //         .select('*')
  //         .eq('user_id', profile.id);

  //       const [ address ] = data
  //       setAddressState(address);
  //     }
  //   };

  //   checkAddress();
  // }, []);


  return (
    // <AuthCheck>
    //     {
    //         addressState
    //         ? <AddressForm profile={profile} />
    //         : props.fallback || <AddressForm profile={profile} />
    //     }
    // </AuthCheck>
  )
}
