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

const CalculateTotal : React.FC<PriceBreakdownCardProps> = ({ products, deliveryCost, taxRate }) => {
      // Calculate subtotal
    const subtotal = products.reduce((acc, product) => acc + product.price * product.quantity, 0);

    return (
      <>
        <div className="flex h-full w-full lg:px-10 px-5 font-poppins">
            <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                    <div className="flex flex-col items-center gap-2 justify-center h-full w-full">
                        <div className="font-poppins h-full w-full">
                            <FormattedMessage
                                id="calculate-total-heading"
                                description="Subtotal" // Description should be a string literal
                                defaultMessage="Subtotal" // Message should be a string literal
                            />
                        </div>
                        <div className="font-poppins text-2xl h-full w-full">
                            {subtotal}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </>
    );
  };
  
  export default CalculateTotal;