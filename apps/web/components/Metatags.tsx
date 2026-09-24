import Head from 'next/head';
import React from 'react';

interface MetatagsProps {
  title?: string;
  description?: string;
  image?: string;
  /** Open Graph type, e.g. "article" for blog posts */
  type?: 'website' | 'article';
  /** Absolute canonical URL of the page */
  url?: string;
  /** Article metadata (ISO dates) */
  publishedTime?: string | null;
  modifiedTime?: string | null;
  author?: string | null;
  /** Structured data rendered as application/ld+json */
  jsonLd?: Record<string, unknown>;
}

const Metatags: React.FC<MetatagsProps> = ({
  title = "Swapnil's Odyssey",
  description = 'Discover insightful articles on technology. swapnilsrivastava.eu offers engaging content to inspire and inform, curated by Swapnil Srivastava.',
  image = 'https://dbydvpdhbaqudqqjteoq.supabase.co/storage/v1/object/sign/avatars/profile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzL3Byb2ZpbGUucG5nIiwiaWF0IjoxNzIyMDMzMzMwLCJleHAiOjIwMzczOTMzMzB9.2fCp8-hDw_e05QacUp-MRSDYVp08Z-4TJzJ8RJqmyKo',
  type = 'website',
  url,
  publishedTime,
  modifiedTime,
  author,
  jsonLd,
}: MetatagsProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@swapnil_sri" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Swapnil's Odyssey" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {jsonLd && (
        <script
          type="application/ld+json"
          // JSON.stringify output with "<" escaped cannot close the script tag
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}
    </Head>
  );
}

export default Metatags;
