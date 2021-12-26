import 'tailwindcss/tailwind.css'
import '../styles/styles.css'
import { ThemeProvider } from 'next-themes'
import Head from 'next/head'
import { AppProps } from 'next/app'

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
