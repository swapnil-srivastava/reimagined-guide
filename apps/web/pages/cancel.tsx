import React from "react";
import Link from 'next/link';
import { FormattedMessage } from 'react-intl';

function Cancel() {
    return (
        <main className='flex flex-col gap-y-10 items-center justify-center'>
          <h1 className="text-blog-black dark:text-blog-white">
            <FormattedMessage
              id="cancel-cancelled"
              description="Cancelled message"
              defaultMessage="Cancelled"
            />
          </h1>
          <iframe src="https://giphy.com/embed/xT5LMFfQQJtiKQ2gCs"             
            width="500"
            height="500" frameBorder="0" 
            allowFullScreen>
          </iframe>
          <Link href="/" legacyBehavior>
            <button className="
            bg-hit-pink-500 text-blog-black
            rounded-lg px-4 py-2 m-2
            transition-filter duration-500 hover:filter hover:brightness-125 
            focus:outline-none focus:ring-2 
            focus:ring-fun-blue-400 
            focus:ring-offset-2 text-sm
            font-semibold">
              <FormattedMessage
                id="cancel-go-home"
                description="Go home button"
                defaultMessage="Go home"
              />
            </button>
          </Link>
        </main>
      );
}

export default Cancel;