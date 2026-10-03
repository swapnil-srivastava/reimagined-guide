import React from "react";
import Link from 'next/link';
import { FormattedMessage } from 'react-intl';
import type { NextPage } from 'next';

const Cancel: NextPage = () => {
    return (
        <main className='font-poppins bg-blog-white min-h-screen text-blog-black flex flex-col gap-y-6 items-center justify-center px-4 py-10 text-center'>
          <h1 className="text-2xl sm:text-3xl font-semibold">
            <FormattedMessage
              id="cancel-cancelled"
              description="Cancelled message"
              defaultMessage="Cancelled"
            />
          </h1>
          <p className="max-w-sm opacity-80">
            <FormattedMessage
              id="cancel-no-charge"
              description="Explains that a cancelled checkout took no payment"
              defaultMessage="Your checkout was cancelled and no payment was taken."
            />
          </p>
          {/* Square box that shrinks to the screen width (the GIF was a fixed 500px and overflowed phones) */}
          <div className="w-full max-w-sm aspect-square rounded-xl overflow-hidden">
            <iframe
              src="https://giphy.com/embed/xT5LMFfQQJtiKQ2gCs"
              title="Cancelled"
              className="w-full h-full"
              frameBorder="0"
              loading="lazy"
              allowFullScreen>
            </iframe>
          </div>
          <Link
            href="/"
            className="
            bg-hit-pink-500 text-[#0a0a0a]
            rounded-lg px-6 py-3
            transition-filter duration-500 hover:filter hover:brightness-125
            focus:outline-none focus-visible:ring-2
            focus-visible:ring-fun-blue-400
            focus-visible:ring-offset-2 text-sm
            font-semibold">
            <FormattedMessage
              id="cancel-go-home"
              description="Go home button"
              defaultMessage="Go home"
            />
          </Link>
        </main>
      );
}

export default Cancel;
