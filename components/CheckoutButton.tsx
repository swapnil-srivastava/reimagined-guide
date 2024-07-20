'use client';

const CheckoutButton = ({  }) => {
    return (
      <>
        <button
            type="button"
            className="bg-hit-pink-500 text-blog-black
            rounded-lg px-4 py-2 m-2
            transition-filter duration-500 hover:filter hover:brightness-125 
            focus:outline-none focus:ring-2 
            focus:ring-fun-blue-400 
            focus:ring-offset-2
            dark:text-blog-black"
        >
            {"Let\'s get started"}
        </button>
      </>
    );
  };
  
  export default CheckoutButton;