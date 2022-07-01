import Head from 'next/head';

export default function Metatags({
  title = 'Swapnil Srivastava',
  description = 'A Bloggin App',
  image = 'https://firebasestorage.googleapis.com/v0/b/didactic-guide.appspot.com/o/image.jpg?alt=media&token=efebcb25-458d-4e37-b046-6eda25124e86',
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