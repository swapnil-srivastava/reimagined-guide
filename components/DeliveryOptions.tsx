'use client';

import { FormattedMessage } from "react-intl";

// Delviory Options Schema
import schema from "../lib/deliveryOptions/deliveryOptionsSchema.json";
import uischema from "../lib/deliveryOptions/uiDeliveryOptionsSchema.json";

// JSON Forms
import { JsonForms } from "@jsonforms/react";
import { rankWith, isEnumControl } from '@jsonforms/core';

// importing material for JSON Forms
import {
    materialCells,
    materialRenderers,
  } from "@jsonforms/material-renderers";

import { useState } from "react";

import CustomRadioGroupControl from './CustomRadioGroupControl';


interface DeliveryOptionsProps {
    deliverySelected: (delivery: any) => void;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({  deliverySelected }) => {
    // const { defaultDelivery } = useProducts();

    const [data, setData] = useState({ deliveryOption: '' });

    const changedJsonSchema = (newData: any, errors: any) => {
        deliverySelected(newData);
        setData(newData);
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
                                    data={data}
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