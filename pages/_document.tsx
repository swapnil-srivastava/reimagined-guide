import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Basic meta tags for all pages */}
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                
                {/* Favicon */}
                <link rel="icon" href="https://dbydvpdhbaqudqqjteoq.supabase.co/storage/v1/object/sign/avatars/profile.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzL3Byb2ZpbGUucG5nIiwiaWF0IjoxNzIyMDMzMzMwLCJleHAiOjIwMzczOTMzMzB9.2fCp8-hDw_e05QacUp-MRSDYVp08Z-4TJzJ8RJqmyKo" type="image/x-icon" />
                
                {/* Preconnect for performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </Head>
            <body className="bg-blog-white dark:bg-fun-blue-500">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}