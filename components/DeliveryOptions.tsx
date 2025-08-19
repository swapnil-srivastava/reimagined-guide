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
        <div className="mt-4">
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
      </>
    );
  };
  
  export default DeliveryOptions;