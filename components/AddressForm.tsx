'use client';

import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
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
    setAddressState: (address: addressJSON) => void;
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
const AddressForm : React.FC<AddressFormProps>= ({ profile, addressState, setAddressState, editSavedAddress, setEditSavedAddress }) => {
    
    type ADDRESS_OBJ = Pick<ADDRESS, "address_line1" | "address_line2" | "city" | "postal_code" | "state" | "country">;

    const [data, setData] = useState<addressJSON>(addressState || initialAddressState);

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
    const createAddress = async () => {
        if (!data?.address_line1 && !data?.address_line2 && !data?.city && !data.postal_code && !data.state && !data.country) return;

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
                setAddressState(data);
                setEditSavedAddress(false);
                toast.success("Address updated!!");
            } else {
                toast.error("Failed to update address");
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
                setAddressState(data);
                toast.success("Address added!!");
            } else {
                toast.error("Failed to add address");
            }
        }
    };

    const clearAddress = async (e) => {
        e.preventDefault();
        clearData();
    };

    return (
      <>
        <div className="flex flex-col gap-2 my-4 px-4 py-2 w-full h-full text-blog-black dark:bg-blog-white">
            <FontAwesomeIcon icon={faCircleXmark} className="cursor-pointer self-end" size="lg" onClick={() => setEditSavedAddress(false)}/>
            <JsonForms
                schema={schema}
                uischema={uischema}
                data={data}
                renderers={materialRenderers}
                cells={materialCells}
                onChange={({ errors, data }) => setData(data)}
            />

            {/* Button Section */}
            <div className="flex self-center gap-2">
                <button type="submit"
                    disabled={!isValidAddressLine1 && !isValidAddressLine2 && !isValidCity && !isValidState && !isValidCountry}
                    className={styles.btnAdmin}
                    onClick={() => createAddress()}>
                    <FormattedMessage
                        id="address-customer-save-btn"
                        description="Save" // Description should be a string literal
                        defaultMessage="Save" // Message should be a string literal
                    />
                </button>
                <button className={styles.btnAdmin} type="button" onClick={clearAddress}>
                    <FormattedMessage
                        id="address-customer-cancel-btn"
                        description="Cancel" // Description should be a string literal
                        defaultMessage="Cancel" // Message should be a string literal
                    />
                </button>
            </div>
        </div>
      </>
    );
  };
  
  export default AddressForm;