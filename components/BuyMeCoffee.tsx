/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client';

// <!-- BUY ME A BEER AND HELP SUPPORT OPEN-SOURCE RESOURCES -->
const BuyMeCoffee = ({  }) => {
    return (
      <>
        <div className="flex items-end justify-end fixed bottom-20 sm:bottom-16 right-0 mb-4 mr-4 z-10">
            <div>
                <a title="Buy me a beer" href="https://www.buymeacoffee.com/swapnilsrivastava" target="_blank" className="block w-full h-12 rounded-full transition-all shadow hover:shadow-lg transform hover:scale-110 hover:rotate-6">
                    <img className="object-cover object-center w-full h-full rounded-full" src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=&button_colour=003e75&font_colour=FBFBFB&font_family=Cookie&outline_colour=FBFBFB&coffee_colour=FFDD00"/>
                </a>
            </div>
        </div>
      </>
    );
  };
  
  export default BuyMeCoffee;