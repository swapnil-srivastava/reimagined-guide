'use client';

import { FormattedMessage } from "react-intl";

// Delviory Options Schema
import schema from "../lib/deliveryOptions/deliveryOptionsSchema.json";
import uischema from "../lib/deliveryOptions/uiDeliveryOptionsSchema.json";

// JSON Forms
import { JsonForms } from "@jsonforms/react";

// importing material for JSON Forms
import {
    materialCells,
    materialRenderers,
  } from "@jsonforms/material-renderers";

import { useState } from "react";
  
const DeliveryOptions: React.FC = ({  }) => {
    // const { defaultDelivery } = useProducts();

    const [data, setData] = useState({ deliveryOption: '' });

    const changedJsonSchema = (newData: any, errors: any) => {
        setData(newData);
        console.log('Data changed:', newData);
        console.log('Errors:', errors);
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
                                    data={data}
                                    renderers={materialRenderers}
                                    cells={materialCells}
                                    onChange={({ errors, data }) => changedJsonSchema(data, errors)}
                                />
                            </div>
                            <div className="mt-4 font-poppins">
                                <p>Selected Delivery Option: {data.deliveryOption}</p>
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