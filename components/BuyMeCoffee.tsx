/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client';

// <!-- BUY ME A BEER AND HELP SUPPORT OPEN-SOURCE RESOURCES -->
const BuyMeCoffee = ({  }) => {
    return (
      <>
        <div className="flex items-end justify-end fixed bottom-4 right-4 z-30">
            <div>
                <a title="Buy me a coffee" href="https://www.buymeacoffee.com/swapnilsrivastava" target="_blank" className="block w-auto h-10 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 hover:rotate-2">
                    <img className="object-cover object-center w-auto h-full rounded-full border-2 border-white" src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=&button_colour=003e75&font_colour=FBFBFB&font_family=Cookie&outline_colour=FBFBFB&coffee_colour=FFDD00"/>
                </a>
            </div>
        </div>
      </>
    );
  };
  
  export default BuyMeCoffee;