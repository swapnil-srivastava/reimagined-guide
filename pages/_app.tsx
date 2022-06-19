

import { Provider } from 'react-redux';
import { useStore } from '../redux/store';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const store = useStore(pageProps.initialReduxState);
  
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
