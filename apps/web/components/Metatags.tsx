import Head from 'next/head';
import React from 'react';

interface MetatagsProps {
  title?: string;
  description?: string;
  image?: string;
}

const Metatags: React.FC<MetatagsProps> = ({
  title = "Swapnil's Odyssey",
  description = 'Discover insightful articles on technology. swapnilsrivastava.eu offers engaging content to inspire and inform, curated by Swapnil Srivastava.',
  image = 'https://dbydvpdhbaqudqqjteoq.supabase.co/storage/v1/object/sign/avatars/profile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzL3Byb2ZpbGUucG5nIiwiaWF0IjoxNzIyMDMzMzMwLCJleHAiOjIwMzczOTMzMzB9.2fCp8-hDw_e05QacUp-MRSDYVp08Z-4TJzJ8RJqmyKo',
}: MetatagsProps) => {
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

export default Metatags;