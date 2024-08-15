'use client';

import { FormattedMessage } from "react-intl";

// Types
import { PRODUCT } from "../database.types";

export interface ProductWithQuantity extends PRODUCT {
    quantity: number;
}

interface PriceBreakdownCardProps {
    products: ProductWithQuantity[];
    deliveryCost?: number;
    taxRate?: number;
}

const CalculateTotal : React.FC<PriceBreakdownCardProps> = ({ products, deliveryCost = 0, taxRate = 0.19 }) => {

    // Calculate subtotal
    const subtotal = products.reduce((acc, product) => acc + product.price * product.quantity, 0);

    // Calculate tax
    const tax = subtotal * taxRate;

    // Calculate total
    const total = subtotal + deliveryCost + tax;

    return (
      <>
        <div className="flex h-full w-full font-poppins">
            <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                    <div className="flex flex-col items-center gap-2 justify-center h-full w-full">
                        <div className="overflow-hidden h-full w-full flex flex-col">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700">
                                        <FormattedMessage
                                            id="calculate-total-subtotal-text"
                                            description="Subtotal:" // Description should be a string literal
                                            defaultMessage="Subtotal:" // Message should be a string literal
                                        />
                                    </span>
                                    <span className="text-gray-900">€ {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700">
                                        <FormattedMessage
                                            id="calculate-total-tax-text"
                                            description="Tax (19%):" // Description should be a string literal
                                            defaultMessage="Tax (19%):" // Message should be a string literal
                                        />
                                    </span>
                                    <span className="text-gray-900">€ {tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700">
                                        <FormattedMessage
                                            id="calculate-total-delivery-cost-text"
                                            description="Delivery Cost:" // Description should be a string literal
                                            defaultMessage="Delivery Cost:" // Message should be a string literal
                                        />
                                    </span>
                                    <span className="text-gray-900">€ {deliveryCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span className="text-gray-700">
                                        <FormattedMessage
                                            id="calculate-total-text"
                                            description="Total:" // Description should be a string literal
                                            defaultMessage="Total:" // Message should be a string literal
                                        />
                                    </span>
                                    <span className="text-gray-900">€ {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </>
    );
  };
  
  export default CalculateTotal;