import React from "react";
import Head from "next/head";
import Link from "next/link";
import { FormattedMessage } from "react-intl";

interface NewsletterStatusPageProps {
  title: string;
  children: React.ReactNode;
}

// Shared layout for the newsletter confirm and unsubscribe pages
export default function NewsletterStatusPage({ title, children }: NewsletterStatusPageProps) {
  return (
    <main className="font-poppins [&_button]:font-poppins bg-blog-white min-h-screen text-blog-black flex flex-col gap-y-6 items-center justify-center px-4 py-10 text-center">
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <h1 className="text-2xl sm:text-3xl font-semibold">{title}</h1>
      <div className="max-w-sm flex flex-col items-center gap-4">{children}</div>
      <Link
        href="/links"
        className="
        bg-hit-pink-500 text-[#0a0a0a]
        rounded-lg px-6 py-3
        transition-filter duration-500 hover:filter hover:brightness-125
        focus:outline-none focus-visible:ring-2
        focus-visible:ring-fun-blue-400
        focus-visible:ring-offset-2 text-sm
        font-semibold">
        <FormattedMessage
          id="newsletter-back-to-links"
          description="Link back to the links page"
          defaultMessage="Back to links"
        />
      </Link>
    </main>
  );
}
