import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head />
            <body className="bg-blog-white dark:bg-fun-blue-500">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
  }