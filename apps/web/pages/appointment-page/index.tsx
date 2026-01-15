import type { NextPage } from "next";
import Link from "next/link";
import React from "react";

const AppointmentPage: NextPage = () => {
  return (
    <div className="flex flex-col h-screen justify-between items-center">
      <div className="flex flex-col justify-between items-center">
        <div className="mt-10 text-3xl dark:text-blog-white text-blog-black font-bold leading-none tracking-tight md:text-5xl lg:text-6xl">
          Appointment Page
        </div>
        <div className="md:text-xl lg:text-2xl text-base dark:text-blog-white text-blog-black font-thin leading-none tracking-tight">
          Book the appointment with the doctor
        </div>
        <div className="md:text-xl lg:text-2xl text-base dark:text-blog-white text-blog-black font-thin leading-none tracking-tight">
          Calendar - Pick a Date
        </div>
        <div className="md:text-xl lg:text-2xl text-base dark:text-blog-white text-blog-black font-thin leading-none tracking-tight">
          Calendar - Pick a Time
        </div>
      </div>
      <div className="flex flex-row mb-10">
        <Link
          href="/appointment-confirmed"
          className="focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2 text-xl font-semibold bg-hit-pink-500 dark:text-blog-black p-2 m-1 flex rounded items-center justify-center gap-x-2 transition-filter duration-500 hover:filter hover:brightness-125"
          role="button"
          aria-label="Book appointment"
        >
          Slide to book
        </Link>
      </div>
    </div>
  );
};

export default AppointmentPage;
