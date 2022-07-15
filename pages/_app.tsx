
import { Provider } from 'react-redux';
import { ThemeProvider } from 'next-themes'
import { useStore } from '../redux/store';

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { Toaster } from 'react-hot-toast';

import '../styles/globals.css';
import { useUserData } from '../lib/hooks';
import AwesomeNavBar from '../components/AwesomeNavBar';

config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  
  const userData = useUserData();
  const store = useStore({...pageProps.initialReduxState, users: userData});

  return (
    <> 
      <ThemeProvider attribute="class">
        <Provider store={store}>
          <AwesomeNavBar />
          <Component {...pageProps} />
          <Toaster />
        </Provider>
      </ThemeProvider>
    </>
  )
}

export default MyApp
