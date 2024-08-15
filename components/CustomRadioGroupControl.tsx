import React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps, isEnumControl, rankWith } from '@jsonforms/core';
import { deliveryOptions } from '../lib/library';
import { FormattedMessage } from 'react-intl';

const CustomRadioGroupControl = ({ data, handleChange, path }: ControlProps) => {
  return (
    <div className="flex flex-col font-poppins">
      {/* <span className="block text-base font-medium text-blog-black dark:text-blog-white mb-2">
        <FormattedMessage
            id="custom-radio-group-control"
            description="Select Delivery Option" // Description should be a string literal
            defaultMessage="Select Delivery Option" // Message should be a string literal
        />
      </span> */}
      {deliveryOptions.map(option => (
        <label key={option.id} className="flex text-base items-center space-x-2 dark:text-blog-white text-blog-black">
          <input
            type="radio"
            name={path}
            value={option.id}
            checked={data?.id === option.id}
            onChange={() => handleChange(path, option)}
            className="form-radio text-fun-blue-600 dark:text-blog-white"
          />
          <span className='text-base'>{option.name}</span>
        </label>
      ))}
    </div>
  );
};

export default withJsonFormsControlProps(CustomRadioGroupControl);