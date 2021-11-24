import 'tailwindcss/tailwind.css'
import '../styles/styles.css'
import { ThemeProvider } from 'next-themes'
import { AppProps } from 'next/app'

function Events({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <meta name="theme-color" content="#D97706" />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default Events
