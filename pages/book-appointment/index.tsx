import React from "react";

const BookAppointment = () => {
  return (
    <div className="flex flex-col h-screen justify-between items-center">
      <div className="flex flex-col justify-between items-center">
        <div className="mt-10 text-3xl dark:text-blog-white text-blog-black font-bold leading-none tracking-tight md:text-5xl lg:text-6xl">
          Schedule Appointment with Ease
        </div>
        <div className="mb-4 md:text-xl lg:text-2xl text-base dark:text-blog-white text-blog-black font-thin leading-none tracking-tight">
          Effortlessly book, reschedule, or cancel appointments with a few
          clicks
        </div>
      </div>
      <div className="flex flex-row mb-10">
        <button
          className="focus:outline-none focus:ring-2 
                      focus:ring-hit-pink-400 
                      focus:ring-offset-2 text-xl
                      font-semibold bg-hit-pink-500 dark:text-blog-black 
                      p-2 m-1 flex rounded items-center justify-center gap-x-2
                      transition-filter duration-500 hover:filter hover:brightness-125"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default BookAppointment;
