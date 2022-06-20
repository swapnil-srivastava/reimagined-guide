import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import toast from 'react-hot-toast';

import Loader from "../components/Loader";
import { useUserData } from '../lib/hooks';

export default function Home() {
  return (
    <div className={styles.container}>
      <button onClick={() => toast.success("hello toast")}>Toast - Click me</button>
    </div>
  )
}
