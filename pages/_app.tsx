import 'tailwindcss/tailwind.css'
import '../styles/styles.css'
import { ThemeProvider } from 'next-themes'

function PHEvents({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class">
      <meta name="theme-color" content="#D97706" />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default PHEvents
