import Head from 'next/head';

export default function Metatags({
  title = 'Swapnil Srivastava',
  description = 'A Bloggin App',
  image = 'google.png',
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="Blog Post" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

    </Head>
  );
}