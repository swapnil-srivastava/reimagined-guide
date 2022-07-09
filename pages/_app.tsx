import { Provider } from 'react-redux';
import { ThemeProvider } from 'next-themes'
import { useStore } from '../redux/store';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';

import '../styles/globals.css';
import { useUserData } from '../lib/hooks';
import AwesomeNavBar from '../components/AwesomeNavBar';

function MyApp({ Component, pageProps }) {
  
  const userData = useUserData();
  const store = useStore({...pageProps.initialReduxState, users: userData});

  return (
    <> 
      <ThemeProvider attribute="class">
        <Provider store={store}>
          {/* <Navbar /> */}
          <AwesomeNavBar />
          <Component {...pageProps} />
          <Toaster />
        </Provider>
      </ThemeProvider>
    </>
  )
}

export default MyApp
