import { faCheck, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import RoundButton from "../../components/RoundButton";

const Pricing = () => {
  return (
    <div className="h-screen flex flex-col items-center gap-2 font-poppins mt-10">
        {/* Title */}
        <div className="text-5xl dark:text-blog-white text-center">Choose the right plan which is best for You!</div>

        {/* Pricing cards */}
        <div className="flex lg:flex-row flex-col gap-5 m-10">
            {/* Pricing card 1 */}
            <div className="mx-10 p-10 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
              <div className="text-center font-thin leading-loose">FREE</div>
              <div className="text-4xl text-center leading-loose">$ 0</div>
              <div className="text-center font-thin leading-loose">No Payment</div>
              <div className="flex flex-col leading-loose">
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
              </div>
              
              {/* button section */}
              <div className="text-center font-thin flex items-center justify-center mt-3">
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
              </div>
            </div>

            {/* Pricing card 2 */}
            <div className="mx-10 p-10 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
              <div className="text-center font-thin leading-loose">Beginner</div>
              <div className="text-4xl text-center leading-loose">$ 10</div>
              <div className="text-center font-thin leading-loose">Payment</div>
              <div className="flex flex-col leading-loose">
                <div className="flex gap-2 leading-loose">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
              </div>
              
              {/* button section */}
              <div className="text-center font-thin flex items-center justify-center mt-3">
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
              </div>
            </div>

            {/* Pricing card 3 */}
            <div className="mx-10 p-10 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
              <div className="text-center font-thin leading-loose">Expert</div>
              <div className="text-4xl text-center leading-loose">$ 100</div>
              <div className="text-center font-thin leading-loose">Payment</div>
              <div className="flex flex-col leading-loose">
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
                <div className="flex gap-2">
                  <div><FontAwesomeIcon icon={faCheck} /></div>
                  <div>Things to be mentioned</div>
                </div>
              </div>
              
              {/* button section */}
              <div className="text-center font-thin flex items-center justify-center mt-3">
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
              </div>
            </div>
        </div>

    </div>
  );
};

export default Pricing;
