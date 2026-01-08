'use client';

import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import toast from "react-hot-toast";

// CSS
import styles from "../styles/Admin.module.css";

// Supabase
import { supaClient } from "../supa-client";

// Supabase UserProfile
import { UserProfile } from "../lib/hooks";

// Product Schema
import schema from "../lib/address/addressSchema.json";
import uischema from "../lib/address/uiAddressSchema.json";

// Local Interface
import { ADDRESS } from "../database.types";

// JSON Forms
import { JsonForms } from "@jsonforms/react";

// importing material for JSON Forms
import {
    materialCells,
    materialRenderers,
  } from "@jsonforms/material-renderers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

import { useDispatch } from "react-redux";
import { addToCartAddressUpdate } from "../redux/actions/actions";

export interface addressJSON {
    address_line1: string;
    address_line2: string;
    city: string;
    postal_code: string;
    state: string;
    country: string;
}

interface AddressFormProps {
    profile: UserProfile | null;
    addressState?: addressJSON;
    editSavedAddress: boolean;
    setEditSavedAddress: (edit: boolean) => void;
}

const initialAddressState = {
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    state: "",
    country: "",
}

// Address Form
const AddressForm : React.FC<AddressFormProps>= ({ profile, addressState, editSavedAddress, setEditSavedAddress }) => {
    const intl = useIntl();
    
    type ADDRESS_OBJ = Pick<ADDRESS, "address_line1" | "address_line2" | "city" | "postal_code" | "state" | "country">;

    const [data, setData] = useState<addressJSON>(addressState || initialAddressState);

    const dispatch = useDispatch();

    const clearData = () => {
        setData(initialAddressState);
    };

    // Validate Length
    const isValidAddressLine1 = data?.address_line1?.length > 2 && data?.address_line1?.length < 255;
    const isValidAddressLine2 = data?.address_line2?.length > 2 && data?.address_line2?.length < 255;
    const isValidCity = data?.city?.length > 2 && data?.city?.length < 100;
    const isValidState = data?.state?.length > 2 && data?.state?.length < 100;
    const isValidCountry = data?.country?.length > 2 && data?.country?.length < 100;

    // Validate Number
    const isValidPostalCode = (postalcode: string): boolean => {
        // Check if stock is numeric
        if (!/^\d+$/.test(postalcode)) {
          return false;
        }
      
        // Convert postalcode to a number
        const postalCodeValue = parseInt(postalcode, 10);
      
        // Validate if postalcode is a more than 5 integer
        return postalcode.length >= 5;
      }


    // Create a new address in supabase postgres
    // For anonymous users (no profile), only store in Redux for checkout
    const createAddress = async () => {
        if (!data?.address_line1 && !data?.address_line2 && !data?.city && !data.postal_code && !data.state && !data.country) return;

        // If no profile (anonymous user), just store in Redux and show success
        if (!profile?.id) {
            dispatch(addToCartAddressUpdate(data));
            setEditSavedAddress(false); // Close the form after saving
            toast.success(intl.formatMessage({
                id: "addressform-address-saved-locally",
                description: "Address saved for checkout",
                defaultMessage: "Address saved for checkout!"
            }));
            return;
        }

        if (editSavedAddress) {
            // Update existing address
            const { data: supaData, error } = await supaClient
                .from("addresses")
                .update({
                    address_line1: data?.address_line1,
                    address_line2: data?.address_line2,
                    city: data?.city,
                    state: data?.state,
                    postal_code: data?.postal_code,
                    country: data?.country,
                })
                .eq('user_id', profile?.id);

            if (!error) {
                dispatch(addToCartAddressUpdate(data));
                setEditSavedAddress(false);
                toast.success(intl.formatMessage({
                    id: "addressform-address-updated",
                    description: "Address updated!!",
                    defaultMessage: "Address updated!!"
                }));
            } else {
                toast.error(intl.formatMessage({
                    id: "addressform-failed-to-update",
                    description: "Failed to update address",
                    defaultMessage: "Failed to update address"
                }));
            }
        } else {
            // Insert new address
            const { data: supaData, error } = await supaClient
                .from("addresses")
                .insert([
                    {
                        user_id: profile?.id,
                        address_line1: data?.address_line1,
                        address_line2: data?.address_line2,
                        city: data?.city,
                        state: data?.state,
                        postal_code: data?.postal_code,
                        country: data?.country,
                    },
                ]);

            if (!error) {
                dispatch(addToCartAddressUpdate(data));
                setEditSavedAddress(false); // Close the form after saving
                toast.success(intl.formatMessage({
                  id: "address-added-success",
                  description: "Address added!!",
                  defaultMessage: "Address added!!"
                }));
            } else {
                toast.error(intl.formatMessage({
                  id: "address-add-failed",
                  description: "Failed to add address",
                  defaultMessage: "Failed to add address"
                }));
            }
        }
    };

    const clearAddress = async (e) => {
        e.preventDefault();
        clearData();
    };

    return (
      <>
        <div className="flex h-full w-full font-poppins">
            <div className="flex flex-col gap-2 py-2 text-blog-black 
                    h-full w-full dark:text-blog-white">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-blog-black dark:text-blog-white">
                        <FormattedMessage
                            id="address-form-title"
                            description="Add the Address"
                            defaultMessage="Add the Address"
                        />
                    </h3>
                    <FontAwesomeIcon 
                        icon={faCircleXmark} 
                        className="cursor-pointer text-gray-500 hover:text-hit-pink-500 transition-colors" 
                        size="lg" 
                        onClick={() => setEditSavedAddress(false)}
                    />
                </div>
                
                <div className="address-form-container [&_.MuiFormControl-root]:mb-3 [&_.MuiInputBase-root]:bg-white [&_.MuiInputBase-root]:dark:bg-fun-blue-700 [&_.MuiInputLabel-root]:text-gray-600 [&_.MuiInputLabel-root]:dark:text-gray-300 [&_.MuiOutlinedInput-notchedOutline]:border-gray-300 [&_.MuiOutlinedInput-notchedOutline]:dark:border-fun-blue-500 [&_.MuiInputBase-input]:text-blog-black [&_.MuiInputBase-input]:dark:text-blog-white">
                    <JsonForms
                        schema={schema}
                        uischema={uischema}
                        data={data}
                        renderers={materialRenderers}
                        cells={materialCells}
                        onChange={({ errors, data }) => setData(data)}
                    />
                </div>

                {/* Button Section */}
                <div className="flex justify-center gap-3 mt-4">
                    <button type="submit"
                        disabled={!isValidAddressLine1 && !isValidAddressLine2 && !isValidCity && !isValidState && !isValidCountry}
                        className="bg-hit-pink-500 text-blog-black rounded-lg px-6 py-2 transition-all duration-300 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => createAddress()}>
                        <FormattedMessage
                            id="address-customer-save-btn"
                            description="Save"
                            defaultMessage="Save"
                        />
                    </button>
                    <button 
                        className="bg-gray-200 dark:bg-fun-blue-600 text-blog-black dark:text-blog-white rounded-lg px-6 py-2 transition-all duration-300 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2 text-sm font-semibold" 
                        type="button" 
                        onClick={clearAddress}>
                        <FormattedMessage
                            id="address-customer-cancel-btn"
                            description="Cancel"
                            defaultMessage="Cancel"
                        />
                    </button>
                </div>
            </div>
        </div>
      </>
    );
  };
  
  export default AddressForm;