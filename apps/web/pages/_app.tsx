import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import { ThemeProvider } from "next-themes";
import { useStore } from "../redux/store";
import { useRouter } from "next/router";
import Head from "next/head";
import { useMemo } from "react";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Toaster } from "react-hot-toast";

import "../styles/globals.css";
import { useUserData } from "../lib/hooks";
import { SITE_URL } from "../lib/site";

import English from "../content/compiled-locales/en-US.json";
import Hindi from "../content/compiled-locales/hi-IN.json";
import German from "../content/compiled-locales/de-DE.json";
import French from "../content/compiled-locales/fr-FR.json";

import AwesomeNavBar from "../components/AwesomeNavBar";
import BuyMeCoffee from "../components/BuyMeCoffee";
import Footer from "../components/Footer";
import dynamic from 'next/dynamic';

// Import CookiesBanner with SSR disabled to prevent hydration errors
const CookiesBanner = dynamic(() => import("../components/CookiesBanner"), { 
  ssr: false
});

import { Roboto, Poppins } from 'next/font/google'

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-roboto',
})

const poppins = Poppins({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-poppins',
})

config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  const userData = useUserData();
  const { locale: nextLocale, defaultLocale: nextDefaultLocale, asPath } = useRouter();
  const store = useStore({ ...pageProps.initialReduxState, users: userData });

  const messages = useMemo(() => {
    switch (nextLocale) {
      case "de-DE":
        return German;
      case "en-US":
        return English;
      case "fr-FR":
        return French;
      case "hi-IN":
        return Hindi;
      default:
        return English;
    }
  }, [nextLocale]);

  // Every domain the site is served on (.eu, .de, previews) points search
  // engines at the same address. Pages can override it with key="canonical".
  const localePrefix = nextLocale && nextLocale !== nextDefaultLocale ? `/${nextLocale}` : "";
  const path = asPath.split(/[?#]/)[0];
  const canonicalUrl = `${SITE_URL}${localePrefix}${path === "/" ? (localePrefix ? "" : "/") : path}`;

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} key="canonical" />
      </Head>
       <main className={`${roboto.variable} ${poppins.variable}`}>
        <ThemeProvider 
          attribute="class"
          defaultTheme="blue-light"
          enableSystem={false}
          value={{
            'blue-light': 'theme-blue-light',
            'blue-dark': 'theme-blue-dark',
            'green-light': 'theme-green-light',
            'green-dark': 'theme-green-dark',
            'purple-light': 'theme-purple-light',
            'purple-dark': 'theme-purple-dark',
            'orange-light': 'theme-orange-light',
            'orange-dark': 'theme-orange-dark',
            'teal-light': 'theme-teal-light',
            'teal-dark': 'theme-teal-dark',
          }}
        >
          <Provider store={store}>
            <IntlProvider
              messages={messages}
              locale={nextLocale}
              defaultLocale={nextDefaultLocale}
            >
              <div className="flex flex-col min-h-screen">
                <AwesomeNavBar />
                <main className="flex-1">
                  <Component {...pageProps} />
                </main>
                <BuyMeCoffee></BuyMeCoffee>
                <Footer />
                <CookiesBanner />
              </div>
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg, #fff)',
                    color: 'var(--toast-text, #0a0a0a)',
                    border: '1px solid var(--toast-border, #e5e7eb)',
                  },
                  success: {
                    style: {
                      background: 'var(--toast-bg, #fff)',
                      color: 'var(--toast-text, #0a0a0a)',
                    },
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    style: {
                      background: 'var(--toast-bg, #fff)',
                      color: 'var(--toast-text, #0a0a0a)',
                    },
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </IntlProvider>
          </Provider>
        </ThemeProvider>
      </main>
    </>
  );
}

export default MyApp;
