'use client';

import { FormattedMessage } from "react-intl";

// Types
import { PRODUCT } from "../database.types";
import { TAX_RATE } from "../lib/library";

export interface ProductWithQuantity extends PRODUCT {
    quantity: number;
}

interface PriceBreakdownCardProps {
    subTotal: number
    deliveryCost: number;
    taxRate: number;
    totalCost: number
}

const CalculateTotal : React.FC<PriceBreakdownCardProps> = ({ subTotal, deliveryCost, taxRate, totalCost }) => {
    return (
      <>
        <div className="flex h-full w-full font-poppins">
            <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600  dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                    <div className="flex flex-col items-center gap-2 justify-center h-full w-full">
                        <div className="overflow-hidden h-full w-full flex flex-col">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span>
                                        <FormattedMessage
                                            id="calculate-total-subtotal-text"
                                            description="Subtotal:" // Description should be a string literal
                                            defaultMessage="Subtotal:" // Message should be a string literal
                                        />
                                    </span>
                                    <span>€ {subTotal?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>
                                        <FormattedMessage
                                            id="calculate-total-tax-text"
                                            description="Tax (19%):" // Description should be a string literal
                                            defaultMessage="Tax (19%):" // Message should be a string literal
                                        />
                                    </span>
                                    <span>€ {taxRate?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>
                                        <FormattedMessage
                                            id="calculate-total-delivery-cost-text"
                                            description="Delivery Cost:" // Description should be a string literal
                                            defaultMessage="Delivery Cost:" // Message should be a string literal
                                        />
                                    </span>
                                    <span>€ {deliveryCost?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span>
                                        <FormattedMessage
                                            id="calculate-total-text"
                                            description="Total:" // Description should be a string literal
                                            defaultMessage="Total:" // Message should be a string literal
                                        />
                                    </span>
                                    <span>€ {totalCost?.toFixed(2)}</span>
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