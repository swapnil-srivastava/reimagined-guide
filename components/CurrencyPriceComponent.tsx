'use client'

const CurrencyPriceComponent = ({price, currency = '€'}) => {
    return (
      <>
        <div className="">
            {currency} {price}
        </div>
      </>
    );
  };
  
  export default CurrencyPriceComponent;