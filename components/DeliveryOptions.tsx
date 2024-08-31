'use client';

import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

// Delviory Options Schema
import schema from "../lib/deliveryOptions/deliveryOptionsSchema.json";
import uischema from "../lib/deliveryOptions/uiDeliveryOptionsSchema.json";

// JSON Forms
import { JsonForms } from "@jsonforms/react";
import { rankWith, isEnumControl } from '@jsonforms/core';

// importing material for JSON Forms
import {
    materialCells,
  } from "@jsonforms/material-renderers";


import CustomRadioGroupControl from './CustomRadioGroupControl';

// Action Crator
import { fetchDeliveryOptions, updateDeliveryOption } from "../redux/actions/actions";
import { RootState } from "../lib/interfaces/interface";


interface DeliveryOptionsProps {

}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = () => {

    const dispatch = useDispatch();

    const deliveryOptions = useSelector((state: RootState) => state.deliveryType.deliveryOptions);
    const deliveryType = useSelector((state: RootState) => state.deliveryType.deliveryType);

    useEffect(() => {
        dispatch(fetchDeliveryOptions());
    }, [dispatch]);

    // const { defaultDelivery } = useProducts(); // call updateDeliveryOption action creator to update the default as well. 

    const changedJsonSchema = (newData: any, errors: any) => {
        dispatch(updateDeliveryOption(newData));
    };

    return (
      <>
        <div className="flex h-full w-full lg:px-10 px-5 font-poppins">
            <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                    <div className="flex flex-col items-center gap-2 justify-center h-full w-full">
                        <div className="font-poppins h-full w-full">
                            <div>
                                <JsonForms
                                    schema={schema}
                                    uischema={uischema}
                                    renderers={[
                                        { tester: rankWith(3, isEnumControl), renderer: CustomRadioGroupControl }
                                      ]}
                                    data={deliveryType}
                                    cells={materialCells}
                                    onChange={({ errors, data }) => changedJsonSchema(data, errors)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </>
    );
  };
  
  export default DeliveryOptions;