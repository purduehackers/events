import '../styles/styles.css'

import { Analytics } from '@vercel/analytics/react'
import { AppProps } from 'next/app'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import Head from 'next/head'
import { ThemeProvider } from 'next-themes'

const spaceGrotesk = Space_Grotesk({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})
const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

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
      <main className={`${spaceMono.variable} ${spaceGrotesk.variable}`}>
        <Component {...pageProps} />
      </main>
      <Analytics />
    </ThemeProvider>
  )
}

export default Events
