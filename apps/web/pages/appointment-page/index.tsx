import Link from "next/link";
import React from "react";

const AppointmentPage = () => {
  return (
    <div className="flex flex-col h-screen justify-between items-center text-blog-black dark:text-blog-white">
      <div className="flex flex-col justify-between items-center">
        <div className="mt-10 text-3xl text-blog-black dark:text-blog-white font-bold leading-none tracking-tight md:text-5xl lg:text-6xl">
          Appointment Page
        </div>
        <div className="md:text-xl lg:text-2xl text-base text-blog-black dark:text-blog-white font-thin leading-none tracking-tight">
          Book the appointment with the doctor
        </div>
        <div className="md:text-xl lg:text-2xl text-base text-blog-black dark:text-blog-white font-thin leading-none tracking-tight">
          Calendar - Pick a Date
        </div>
        <div className="md:text-xl lg:text-2xl text-base text-blog-black dark:text-blog-white font-thin leading-none tracking-tight">
          Calendar - Pick a Time
        </div>
      </div>
      <div className="flex flex-row mb-10">
        <Link href="/appointment-confirmed" legacyBehavior>
          <button
            className="focus:outline-none focus:ring-2 
                      focus:ring-hit-pink-400 
                      focus:ring-offset-2 text-xl
                      font-semibold text-blog-black dark:text-blog-white bg-hit-pink-500 
                      p-2 m-1 flex rounded items-center justify-center gap-x-2
                      transition-filter duration-500 hover:filter hover:brightness-125"
          >
            Slide to book
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AppointmentPage;
