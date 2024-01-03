import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import { ThemeProvider } from "next-themes";
import { useStore } from "../redux/store";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Toaster } from "react-hot-toast";

import "../styles/globals.css";
import { useUserData } from "../lib/hooks";

import English from "../content/compiled-locales/en_US.json";
import Hindi from "../content/compiled-locales/hi_IN.json";
import German from "../content/compiled-locales/de_DE.json";
import French from "../content/compiled-locales/fr_FR.json";

import AwesomeNavBar from "../components/AwesomeNavBar";
import BuyMeCoffee from "../components/BuyMeCoffee";
import CookiesBanner from "../components/CookiesBanner";

config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  const userData = useUserData();
  const { locale: nextLocale, defaultLocale: nextDefaultLocale } = useRouter();
  const store = useStore({ ...pageProps.initialReduxState, users: userData });

  const messages = useMemo(() => {
    switch (nextLocale) {
      case "de_DE":
        return German;
      case "en_US":
        return English;
      case "fr_FR":
        return French;
      case "hi_IN":
        return Hindi;
      default:
        return English;
    }
  }, [nextLocale]);

  return (
    <>
      <ThemeProvider attribute="class">
        <Provider store={store}>
          <IntlProvider
            messages={messages}
            locale={nextLocale}
            defaultLocale={nextDefaultLocale}
          >
            <div className="flex flex-col gap-2">
              <AwesomeNavBar />
              <Component {...pageProps} />
              <BuyMeCoffee></BuyMeCoffee>
              <CookiesBanner></CookiesBanner>
            </div>
            <Toaster />
          </IntlProvider>
        </Provider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
