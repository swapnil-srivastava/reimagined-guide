

import { Provider } from 'react-redux';
import { useStore } from '../redux/store';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';

import '../styles/globals.css';
import { useUserData } from '../lib/hooks';

function MyApp({ Component, pageProps }) {
  
  const userData = useUserData();
  const store = useStore({...pageProps.initialReduxState, users: userData});

  return (
    <>
      <Provider store={store}>
        <Navbar />
        <Component {...pageProps} />
        <Toaster />
      </Provider>
    </>
  )
}

export default MyApp
