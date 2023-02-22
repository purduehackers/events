import '../styles/styles.css'
import { ThemeProvider } from 'next-themes'
import Head from 'next/head'
import { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'

function Events({ Component, pageProps }: AppProps) {
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV
  return (
    <ThemeProvider attribute="class">
      <Head>
        <meta name="theme-color" content="#D97706" />
        <link
          rel="icon"
          href={
            vercelEnv === 'production'
              ? '/favicon.ico'
              : vercelEnv === 'preview'
              ? '/favicon_preview.ico'
              : '/favicon_dev.ico'
          }
        />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </ThemeProvider>
  )
}

export default Events
