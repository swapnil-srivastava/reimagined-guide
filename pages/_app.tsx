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
import English from "../content/compiled-locales/en-US.json";
import Hindi from "../content/compiled-locales/hi-IN.json";
import German from "../content/compiled-locales/de-DE.json";
import French from "../content/compiled-locales/fr-FR.json";
import AwesomeNavBar from "../components/AwesomeNavBar";

config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  const userData = useUserData();
  const { locale: nextLocale, defaultLocale: nextDefaultLocale } = useRouter();
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
            </div>
            <Toaster />
          </IntlProvider>
        </Provider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
