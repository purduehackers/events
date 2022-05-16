import '../styles/styles.css'
import { ThemeProvider } from 'next-themes'
import Head from 'next/head'
import { AppProps } from 'next/app'
import 'react-image-lightbox/style.css'

function Events({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <Head>
        <meta name="theme-color" content="#D97706" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default Events
