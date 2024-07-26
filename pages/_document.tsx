import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <link rel="icon" href="https://dbydvpdhbaqudqqjteoq.supabase.co/storage/v1/object/sign/avatars/profile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzL3Byb2ZpbGUucG5nIiwiaWF0IjoxNzIyMDMzMzMwLCJleHAiOjIwMzczOTMzMzB9.2fCp8-hDw_e05QacUp-MRSDYVp08Z-4TJzJ8RJqmyKo" type="image/x-icon" />
            </Head>
            <body className="bg-blog-white dark:bg-fun-blue-500">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
  }