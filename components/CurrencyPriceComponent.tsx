'use client'

const CurrencyPriceComponent = ({price, currency = '€'}) => {
    return (
      <>
        <div className="text-sm">
            {currency} {price}
        </div>
      </>
    );
  };
  
  export default CurrencyPriceComponent;